import { OpenAI } from 'openai';
import path from 'path';
import config from './config.js';
/**
 * Анализирует файлы проекта с использованием ChatGPT API и управляет прогрессом анализа
 */
class ProjectAnalyzer {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      organization: config.openaiOrkKey,
    });
  }
  /**
   * Анализирует список файлов, используя кэш где возможно
   */
  async analyzeFiles(files, logger) {
  logger.info(`Начало анализа ${files.length} файлов`);
  const results = [];
  // Обрабатываем файлы партиями для оптимальной работы с API
  for (let i = 0; i < files.length; i += config.batchSize) {
    const batch = files.slice(i, i + config.batchSize);
    logger.info(`Обработка партии ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(files.length / config.batchSize)}`);
    
    const batchPromises = batch.map(file => this.processFile(file, logger));
    const batchResults = await Promise.allSettled(batchPromises);
    
    let apiCallsInBatch = 0; // Счетчик реальных вызовов API в партии
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        // Проверяем, был ли это реальный API вызов или кеш
        if (result.value.fromCache === false) {
          apiCallsInBatch++;
        }
      } else {
        logger.error(`Ошибка при анализе файла: ${result.reason}`);
      }
    }
    
    // Добавляем задержку между партиями только если были реальные вызовы API
    if (i + config.batchSize < files.length && apiCallsInBatch > 0) {
      logger.info(`Ждем ${config.batchDelay}мс перед следующей партией (было ${apiCallsInBatch} API вызовов)...`);
      await new Promise(resolve => setTimeout(resolve, config.batchDelay));
    } else if (i + config.batchSize < files.length) {
      logger.info(`Пропускаем ожидание - все файлы партии загружены из кеша`);
    }
  }
  
  // Обновляем структуру проекта с результатами анализа
  await this.updateProjectStructureWithAnalysis(results, logger);
  
  // Группируем результаты по модулям/компонентам
  return this.groupResults(results);
}
  /**
   * Обрабатывает отдельный файл, используя кэш если возможно
   */
  async processFile(file, logger) {
    const fileId = this.stateManager.getFileId(file);
    try {
      // Проверяем, нужно ли анализировать файл или можно использовать кэш
      const { shouldAnalyze, cachedAnalysis } = await this.stateManager.shouldAnalyzeFile(file, logger);
      if (!shouldAnalyze && cachedAnalysis) {
        logger.info(`Используем кэшированный анализ для ${file.relativePath}`);
        return {
          ...cachedAnalysis,
          fromCache: true // Помечаем, что результат из кеша
        };
      }
      // Если анализ нужен, отправляем файл в ChatGPT
      logger.info(`Анализируем файл: ${file.relativePath} (${this.formatFileSize(file.size)})`);
      const analysis = await this.sendToChatGPT(file, logger);
      // Сохраняем результат в кэш
      await this.stateManager.saveFileAnalysis(file, analysis);
      return {
        ...analysis,
        fromCache: false // Помечаем, что результат получен через API
      };
    } catch (err) {
      logger.error(`Ошибка при обработке файла ${file.relativePath}: ${err.message}`);
      return {
        path: file.path,
        relativePath: file.relativePath,
        type: file.type,
        name: file.name,
        error: err.message,
        fromCache: false, // Ошибка = не из кеша
        analysis: {
          summary: `Ошибка при анализе файла: ${err.message}`,
          purpose: 'Неизвестно из-за ошибки анализа',
          components: [],
          functions: [],
          dependencies: [],
        },
      };
    }
  }
  /**
   * Форматирует размер файла для вывода
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  /**
   * Отправляет файл на анализ в ChatGPT
   */
  async sendToChatGPT(file, logger) {
    const fileTypePrompts = {
      '.js': 'Это JavaScript файл. Проанализируйте его назначение, экспортируемые функции/классы и зависимости.',
      '.vue': 'Это Vue компонент. Проанализируйте секции template, script и style.',
      '.scss': 'Это SCSS стиль. Проанализируйте переменные, миксины и стили.',
      '.css': 'Это CSS стиль. Проанализируйте стили и структуру.',
      '.json': 'Это JSON файл. Проанализируйте его структуру и назначение.',
    };
    const fileTypePrompt = fileTypePrompts[file.extension] || 'Проанализируйте этот файл.';
    const isFramework = file.type === 'framework';
    const prompt = `
Вы анализируете файл из ${isFramework ? 'фреймворка "martyrs"' : 'проекта, который использует фреймворк "martyrs"'}.
Файл: ${file.relativePath}
${fileTypePrompt}

Предоставьте структурированный анализ со следующей информацией:
1. Summary: Краткое описание того, что делает этот файл
2. Purpose: Основное назначение этого файла в ${isFramework ? 'фреймворке' : 'проекте'}
3. Components: Список основных компонентов или классов с их обязанностями
4. Functions: Список ключевых функций с их назначением и параметрами
5. Dependencies: От каких других модулей зависит этот файл
6. Usage: Как этот файл обычно используется или импортируется другими файлами
7. Importance: Оцените важность файла для общей архитектуры по шкале от 1 до 5
8. Notes: Любые особые соображения или детали реализации, которые стоит отметить

Отформатируйте ваш ответ как валидный JSON с этими полями.
`;
    // Обрезаем содержимое, если необходимо
    let content = file.content;
    if (content.length > config.maxTokensPerRequest * 4) {
      // Грубая оценка токенов
      content = content.substring(0, config.maxTokensPerRequest * 4) + '\n\n[Содержимое обрезано из-за длины...]';
    }
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openaiModel,
        messages: [
          {
            role: 'system',
            content: 'Вы специалист по документации, который анализирует файлы кода и предоставляет структурированный анализ.',
          },
          {
            role: 'user',
            content: prompt + '\n\nСодержимое файла:\n```' + file.extension + '\n' + content + '\n```',
          },
        ],
        temperature: 0,
        max_completion_tokens: 2000,
      });
      const analysisText = response.choices[0].message.content;
      let analysis;
      try {
        // Извлекаем JSON из ответа
        const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/```\n([\s\S]*?)\n```/) || [null, analysisText];
        analysis = JSON.parse(jsonMatch[1] || analysisText);
      } catch (err) {
        logger.warn(`Не удалось разобрать ответ как JSON: ${err.message}`);
        // Если разбор не удался, возвращаем сырой текст
        analysis = {
          summary: 'Не удалось разобрать анализ как JSON',
          rawAnalysis: analysisText,
        };
      }
      return {
        path: file.path,
        relativePath: file.relativePath,
        type: file.type,
        name: file.name,
        extension: file.extension,
        analysis,
      };
    } catch (err) {
      logger.error(`Ошибка API при анализе ${file.relativePath}: ${err.message}`);
      throw err;
    }
  }
  /**
   * Группирует результаты анализа по их реальной структуре папок
   */
  groupResults(results) {
    const groups = {
      _files: [],  // Добавляем массив для файлов в корне
      _path: '',
      _depth: -1
    };
    
    for (const result of results) {
      if (!result.relativePath) continue;
      
      const pathParts = result.relativePath.split(path.sep);
      
      // Если файл в корне (только имя файла без папок)
      if (pathParts.length === 1) {
        groups._files.push(result);
        continue;
      }
      
      // Создаем иерархию групп на основе реальной структуры папок
      let currentGroup = groups;
      
      // Проходим по всем частям пути, кроме последней (имя файла)
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        
        // Создаем группу, если её нет
        if (!currentGroup[part]) {
          currentGroup[part] = {
            _files: [],
            _path: pathParts.slice(0, i + 1).join(path.sep),
            _depth: i
          };
        }
        
        currentGroup = currentGroup[part];
      }
      
      // Убеждаемся, что _files существует и добавляем файл
      if (!currentGroup._files) {
        currentGroup._files = [];
      }
      currentGroup._files.push(result);
    }
    
    // Удаляем пустые группы и оптимизируем структуру
    return this.optimizeGroupStructure(groups);
  }
  
  /**
   * Оптимизирует структуру групп, убирая промежуточные папки с одним элементом
   */
  optimizeGroupStructure(groups) {
    const optimized = {};
    
    for (const [key, group] of Object.entries(groups)) {
      if (typeof group !== 'object' || key.startsWith('_')) continue;
      
      // Если в группе только файлы, оставляем как есть
      if (group._files && group._files.length > 0) {
        const subGroups = Object.keys(group).filter(k => !k.startsWith('_'));
        
        if (subGroups.length === 0) {
          // Только файлы, без подгрупп
          optimized[key] = {
            files: group._files,
            path: group._path,
            type: 'directory'
          };
        } else if (subGroups.length === 1 && group._files.length === 0) {
          // Одна подгруппа без файлов - можно "схлопнуть"
          const subKey = subGroups[0];
          const newKey = `${key}/${subKey}`;
          optimized[newKey] = this.optimizeGroupStructure({ [subKey]: group[subKey] })[subKey];
        } else {
          // Смешанный случай - файлы и подгруппы
          optimized[key] = {
            files: group._files,
            path: group._path,
            type: 'directory',
            subdirectories: this.optimizeGroupStructure(
              Object.fromEntries(
                subGroups.map(k => [k, group[k]])
              )
            )
          };
        }
      } else {
        // Рекурсивно обрабатываем подгруппы
        const subGroups = Object.keys(group).filter(k => !k.startsWith('_'));
        if (subGroups.length > 0) {
          optimized[key] = this.optimizeGroupStructure(
            Object.fromEntries(
              subGroups.map(k => [k, group[k]])
            )
          );
        }
      }
    }
    
    return optimized;
  }
  async updateProjectStructureWithAnalysis(analysisResults, logger) {
    logger.info('Обновление структуры проекта с результатами анализа');
    
    // Получаем текущую структуру проекта
    const projectStructure = this.stateManager.documentationState.projectStructure;
    
    if (!projectStructure) {
      logger.error('Структура проекта не найдена');
      return;
    }
    
    // Обновляем каждый файл в структуре с его анализом
    for (const result of analysisResults) {
      this.updateFileInStructure(projectStructure, result);
    }
    
    // Сохраняем обновленную структуру
    await this.stateManager.saveProjectStructure(projectStructure);
    logger.info('Структура проекта обновлена с результатами анализа');
  }

  /**
   * Обновляет файл в структуре проекта с результатами анализа
   */
  updateFileInStructure(structure, analysisResult) {
    const pathParts = analysisResult.relativePath.split(path.sep);
    const topLevel = analysisResult.type; // 'framework' или 'source'
    
    // Находим нужный уровень в структуре
    let currentLevel = structure[topLevel];
    if (!currentLevel) return;
    
    // Проходим по пути к файлу
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!currentLevel[part]) return;
      currentLevel = currentLevel[part];
    }
    
    // Находим файл в массиве _files
    if (currentLevel._files && Array.isArray(currentLevel._files)) {
      const fileIndex = currentLevel._files.findIndex(
        file => file.name === analysisResult.name
      );
      
      if (fileIndex !== -1) {
        // Добавляем анализ к файлу
        currentLevel._files[fileIndex].analysis = analysisResult.analysis;
      }
    }
  }
}
export default ProjectAnalyzer;