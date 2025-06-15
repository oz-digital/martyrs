import { promises } from 'fs';
import path from 'path';
import config from './config.js';
// doc-generator/fileScanner.js
const fs = { promises }.promises;
/**
 * Класс для сканирования файлов проекта
 */
class ProjectScanner {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }
  /**
   * Сканирует проект и возвращает список файлов для анализа
   */
  async scanProject(rootDir, logger) {
    logger.info(`Начало сканирования проекта в директории: ${rootDir}`);
    const files = [];
    const frameworkDir = path.join(rootDir, config.frameworkDir);
    const sourceDir = path.join(rootDir, config.sourceDir);
    // Сначала сканируем файлы фреймворка
    if (await this.directoryExists(frameworkDir)) {
      logger.info(`Сканирование директории фреймворка: ${frameworkDir}`);
      const frameworkFiles = await this.scanDirectory(frameworkDir);
      files.push(...frameworkFiles.map(file => ({ ...file, type: 'framework' })));
      logger.info(`Найдено ${frameworkFiles.length} файлов в директории фреймворка`);
    } else {
      logger.warn(`Директория фреймворка не найдена: ${frameworkDir}`);
    }
    // Затем сканируем исходники проекта
    if (await this.directoryExists(sourceDir)) {
      logger.info(`Сканирование директории исходников: ${sourceDir}`);
      const sourceFiles = await this.scanDirectory(sourceDir);
      files.push(...sourceFiles.map(file => ({ ...file, type: 'source' })));
      logger.info(`Найдено ${sourceFiles.length} файлов в директории исходников`);
    } else {
      logger.warn(`Директория исходников не найдена: ${sourceDir}`);
    }
    // Группируем и приоритизируем файлы
    const prioritizedFiles = this.prioritizeFiles(files);
    logger.info(`Всего найдено ${prioritizedFiles.length} файлов для анализа`);
    // Строим и сохраняем структуру проекта
    const projectStructure = this.buildProjectStructure(prioritizedFiles);
    await this.stateManager.saveProjectStructure(projectStructure);
    return prioritizedFiles;
  }
  /**
   * Проверяет существование директории
   */
  async directoryExists(dir) {
    try {
      const stats = await fs.stat(dir);
      return stats.isDirectory();
    } catch (err) {
      return false;
    }
  }
  /**
   * Рекурсивно сканирует директорию и собирает файлы
   */
  async scanDirectory(dir, baseDir = dir) {
    const results = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        // Пропускаем исключенные директории
        if (entry.isDirectory()) {
          if (config.fileTypes.exclude.some(excludeDir => entry.name === excludeDir || fullPath.includes(`/${excludeDir}/`))) {
            continue;
          }
          results.push(...(await this.scanDirectory(fullPath, baseDir)));
        } else {
          // Проверяем, входит ли расширение файла в список включенных
          const ext = path.extname(entry.name).toLowerCase();
          if (config.fileTypes.include.includes(ext)) {
            try {
              const content = await fs.readFile(fullPath, 'utf8');
              results.push({
                path: fullPath,
                relativePath,
                extension: ext,
                content,
                name: entry.name,
                size: content.length,
              });
            } catch (err) {
              console.error(`Ошибка чтения файла ${fullPath}:`, err.message);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Ошибка при сканировании директории ${dir}:`, err.message);
    }
    return results;
  }
  /**
   * Сортирует файлы по приоритету и логическому порядку
   */
  prioritizeFiles(files) {
    return files.sort((a, b) => {
      // Сначала файлы фреймворка, потом исходники
      if (a.type !== b.type) {
        return a.type === 'framework' ? -1 : 1;
      }
      // Сортировка по приоритету расширения файла
      const extPriority = {
        '.js': 1,
        '.vue': 2,
        '.scss': 3,
        '.css': 4,
        '.json': 5,
      };
      const aPriority = extPriority[a.extension] || 99;
      const bPriority = extPriority[b.extension] || 99;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      // Сортировка по пути файла
      return a.relativePath.localeCompare(b.relativePath);
    });
  }
  /**
   * Строит структуру проекта на основе отсканированных файлов
   */
  buildProjectStructure(files) {
    const structure = {
      framework: {},
      source: {},
    };
    for (const file of files) {
      if (!file.relativePath) continue;
      const pathParts = file.relativePath.split(path.sep);
      const topLevel = file.type; // 'framework' или 'source'
      // Строим структуру директорий
      let currentLevel = structure[topLevel];
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!currentLevel[part]) {
          currentLevel[part] = {};
        }
        currentLevel = currentLevel[part];
      }
      // Добавляем файл в соответствующую директорию
      if (!currentLevel._files) {
        currentLevel._files = [];
      }
      currentLevel._files.push(file);
    }
    return structure;
  }
}
export default ProjectScanner;
