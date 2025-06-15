import { OpenAI } from 'openai';
import path from 'path';
import config from './config.js';
import { promises as fs } from 'fs';
import crypto from 'crypto';

/**
 * Класс для генерации оглавления документации на основе готовых анализов файлов
 */
class TocGenerator {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      organization: config.openaiOrkKey,
    });
    this.maxRetries = 3;
    
    // Путь для кеширования TOC и его частей
    this.tocCacheDir = path.join(process.cwd(), config.stateDir, 'toc_cache');
    this.tocMainFile = path.join(this.tocCacheDir, 'main_toc.json');
    this.tocSectionsDir = path.join(this.tocCacheDir, 'sections');
    
    // Максимальная глубина группировки
    this.maxGroupingDepth = config.maxTocGroupingDepth || 2;
  }

  /**
   * Инициализирует директории для кеширования
   */
  async initializeCacheDirectories(logger) {
    try {
      await fs.mkdir(this.tocCacheDir, { recursive: true });
      await fs.mkdir(this.tocSectionsDir, { recursive: true });
      logger.info('Инициализированы директории кеша TOC');
    } catch (err) {
      logger.error(`Ошибка при создании директорий кеша: ${err.message}`);
    }
  }

  /**
   * Генерирует хеш для группы файлов на основе их хешей
   */
  generateGroupHash(fileHashes) {
    const combinedHashes = fileHashes.sort().join('|');
    return crypto.createHash('md5').update(combinedHashes).digest('hex');
  }

  /**
   * Загружает основной кешированный TOC
   */
  async loadMainTocCache(logger) {
    try {
      const content = await fs.readFile(this.tocMainFile, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      return null;
    }
  }

  /**
   * Сохраняет основной TOC в кеш
   */
  async saveMainTocCache(toc, sectionsInfo, logger) {
    try {
      const cacheData = {
        toc: toc,
        sectionsInfo: sectionsInfo, // Информация о секциях и их хешах
        generated: new Date().toISOString()
      };
      await fs.writeFile(this.tocMainFile, JSON.stringify(cacheData, null, 2), 'utf8');
      logger.info('Основной TOC сохранен в кеш');
    } catch (err) {
      logger.error(`Ошибка при сохранении основного TOC: ${err.message}`);
    }
  }

  /**
   * Загружает кешированную секцию TOC
   */
  async loadSectionCache(sectionId, logger) {
    try {
      const sectionFile = path.join(this.tocSectionsDir, `${sectionId}.json`);
      const content = await fs.readFile(sectionFile, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      return null;
    }
  }

  /**
   * Сохраняет секцию TOC в кеш
   */
  async saveSectionCache(sectionId, section, fileHashes, logger) {
    try {
      const sectionFile = path.join(this.tocSectionsDir, `${sectionId}.json`);
      const cacheData = {
        section: section,
        fileHashes: fileHashes, // Хеши файлов, использованных для генерации
        groupHash: this.generateGroupHash(fileHashes),
        generated: new Date().toISOString()
      };
      await fs.writeFile(sectionFile, JSON.stringify(cacheData, null, 2), 'utf8');
      logger.info(`Секция ${sectionId} сохранена в кеш`);
    } catch (err) {
      logger.error(`Ошибка при сохранении секции ${sectionId}: ${err.message}`);
    }
  }

  /**
   * Проверяет, изменились ли файлы в группе
   */
  async checkGroupFilesChanged(groupPath, analyses, logger) {
    // Собираем текущие хеши файлов из stateManager
    const currentFileHashes = [];
    
    for (const analysis of analyses) {
      const fileId = this.stateManager.getFileId({ relativePath: analysis.path });
      const fileInfo = this.stateManager.documentationState.analyzedFiles[fileId];
      
      if (fileInfo && fileInfo.hash) {
        currentFileHashes.push(fileInfo.hash);
      } else {
        // Если файл не найден или нет хеша, считаем что группа изменилась
        logger.info(`Файл ${analysis.path} не имеет хеша, группа ${groupPath} требует регенерации`);
        return { changed: true, fileHashes: currentFileHashes };
      }
    }
    
    // Загружаем кешированную информацию о секции
    const sectionId = this.createSlug(groupPath);
    const cachedSection = await this.loadSectionCache(sectionId, logger);
    
    if (!cachedSection) {
      logger.info(`Нет кеша для секции ${sectionId}, требуется генерация`);
      return { changed: true, fileHashes: currentFileHashes };
    }
    
    // Сравниваем хеш группы
    const currentGroupHash = this.generateGroupHash(currentFileHashes);
    if (cachedSection.groupHash !== currentGroupHash) {
      logger.info(`Хеш группы ${groupPath} изменился, требуется регенерация`);
      return { changed: true, fileHashes: currentFileHashes };
    }
    
    return { changed: false, fileHashes: currentFileHashes, cachedSection: cachedSection.section };
  }

  /**
   * Генерирует глобальное оглавление с использованием гранулярного кеширования
   */
  async generateGlobalToc(projectStructure, logger) {
    logger.info('Генерация TOC с гранулярным кешированием');

    try {
      // Инициализируем директории кеша
      await this.initializeCacheDirectories(logger);

      // Шаг 1: Собираем все готовые анализы файлов
      const fileAnalyses = await this.collectFileAnalyses(projectStructure, logger);
      logger.info(`Собрано ${fileAnalyses.length} анализов файлов`);

      // Шаг 2: Группируем анализы по структуре папок
      const groupedAnalyses = this.groupAnalysesByFolderStructure(fileAnalyses, logger);
      logger.info(`Создано ${Object.keys(groupedAnalyses).length} групп модулей`);

      // Шаг 3: Проверяем кеш и генерируем/обновляем только измененные секции
      const tocSections = [];
      const sectionsInfo = {};
      let regeneratedCount = 0;
      let cachedCount = 0;

      for (const [groupPath, analyses] of Object.entries(groupedAnalyses)) {
        const { changed, fileHashes, cachedSection } = await this.checkGroupFilesChanged(
          groupPath, 
          analyses, 
          logger
        );
        
        const sectionId = this.createSlug(groupPath);
        
        if (!changed && cachedSection) {
          // Используем кешированную секцию
          logger.info(`Используем кеш для группы: ${groupPath}`);
          tocSections.push(cachedSection);
          sectionsInfo[sectionId] = {
            fileHashes: fileHashes,
            groupHash: this.generateGroupHash(fileHashes)
          };
          cachedCount++;
        } else {
          // Генерируем новую секцию
          logger.info(`Генерация раздела TOC для группы: ${groupPath} (${analyses.length} файлов)`);
          const section = await this.generateSectionForGroup(groupPath, analyses, logger);
          
          if (section) {
            tocSections.push(section);
            
            // Сохраняем секцию в кеш
            await this.saveSectionCache(sectionId, section, fileHashes, logger);
            
            sectionsInfo[sectionId] = {
              fileHashes: fileHashes,
              groupHash: this.generateGroupHash(fileHashes)
            };
            regeneratedCount++;
          }
        }
      }

      logger.info(`Использовано кешированных секций: ${cachedCount}, регенерировано: ${regeneratedCount}`);

      // Шаг 4: Создаем финальную структуру TOC
      const finalToc = {
        title: "Документация проекта",
        sections: [
          {
            id: "introduction",
            title: "Введение",
            description: "Общее описание проекта и фреймворка martyrs",
            subsections: []
          },
          ...tocSections
        ]
      };

      // Шаг 5: Сохраняем результат
      this.enrichTocWithMetadata(finalToc);
      
      // Сохраняем основной TOC с информацией о секциях
      await this.saveMainTocCache(finalToc, sectionsInfo, logger);
      
      // Сохраняем в state manager
      await this.stateManager.saveSection('toc', {
        structure: finalToc,
        generated: true,
        cachedSections: cachedCount,
        regeneratedSections: regeneratedCount
      });
      await this.stateManager.markTocAsGenerated();

      logger.info('TOC успешно сгенерирован с гранулярным кешированием');
      return finalToc;

    } catch (error) {
      logger.error(`Ошибка при генерации TOC: ${error.message}`);
      throw error;
    }
  }

  /**
   * Очищает устаревшие секции из кеша
   */
  async cleanupObsoleteSections(currentSectionIds, logger) {
    try {
      const files = await fs.readdir(this.tocSectionsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const sectionId = path.basename(file, '.json');
          if (!currentSectionIds.includes(sectionId)) {
            const filePath = path.join(this.tocSectionsDir, file);
            await fs.unlink(filePath);
            logger.info(`Удалена устаревшая секция из кеша: ${sectionId}`);
          }
        }
      }
    } catch (err) {
      logger.error(`Ошибка при очистке кеша секций: ${err.message}`);
    }
  }

  /**
   * Собирает все готовые анализы файлов из структуры проекта
   */
  async collectFileAnalyses(projectStructure, logger) {
    const analyses = [];
    
    // Собираем анализы из фреймворка
    if (projectStructure.framework) {
      this.collectAnalysesFromStructure(projectStructure.framework, 'framework', analyses);
    }
    
    // Собираем анализы из исходников проекта
    if (projectStructure.source) {
      this.collectAnalysesFromStructure(projectStructure.source, 'source', analyses);
    }
    
    logger.info(`Собрано ${analyses.length} анализов (framework: ${analyses.filter(a => a.type === 'framework').length}, source: ${analyses.filter(a => a.type === 'source').length})`);
    
    return analyses;
  }

  /**
   * Рекурсивно собирает анализы из структуры
   */
  collectAnalysesFromStructure(structure, type, analyses) {
    // Защита от undefined структуры
    if (!structure) {
      return;
    }
    
    // Собираем файлы на текущем уровне
    if (structure._files) {
      for (const file of structure._files) {
        if (file.analysis) {
          analyses.push({
            type: type,
            name: file.name,
            path: file.relativePath,
            extension: file.extension,
            analysis: file.analysis
          });
        }
      }
    }

    // Рекурсивно обходим поддиректории
    for (const key in structure) {
      if (key !== '_files' && typeof structure[key] === 'object') {
        this.collectAnalysesFromStructure(structure[key], type, analyses);
      }
    }
  }

  /**
   * Группирует анализы по реальной структуре папок
   */
  groupAnalysesByFolderStructure(analyses, logger) {
    const groups = {};

    for (const analysis of analyses) {
      // Получаем путь к папке для группировки с учетом максимальной глубины
      const folderPath = this.getFolderPath(analysis.path, analysis.type);
      
      if (!groups[folderPath]) {
        groups[folderPath] = [];
      }
      
      groups[folderPath].push(analysis);
    }

    // Логируем размеры групп
    for (const [groupPath, groupAnalyses] of Object.entries(groups)) {
      logger.info(`Группа "${groupPath}": ${groupAnalyses.length} файлов`);
    }

    return groups;
  }

  /**
   * Получает путь к папке для группировки с учетом максимальной глубины
   */
  getFolderPath(filePath, type) {
    const parts = filePath.split(path.sep);
    
    // Убираем имя файла
    parts.pop();
    
    // Для файлов верхнего уровня
    if (parts.length === 0) {
      return `${type}-root`;
    }
    
    // Для фреймворка убираем первую часть пути (martyrs/)
    if (type === 'framework' && parts[0] === config.frameworkDir) {
      parts.shift();
    }
    
    // Для исходников проекта убираем первую часть пути (src/)
    if (type === 'source' && parts[0] === config.sourceDir) {
      parts.shift();
    }
    
    // Если после удаления префикса остался пустой путь
    if (parts.length === 0) {
      return `${type}-root`;
    }
    
    // Ограничиваем глубину группировки
    if (parts.length > this.maxGroupingDepth) {
      parts.length = this.maxGroupingDepth;
    }
    
    // Возвращаем путь с префиксом типа
    return `${type}/${parts.join('/')}`;
  }

  /**
   * Генерирует раздел TOC для группы анализов файлов
   */
  async generateSectionForGroup(groupPath, analyses, logger) {
    // Уменьшаем размер батча для больших групп
    const batchSize = analyses.length > 40 ? 15 : 20;
    const batches = [];
    
    for (let i = 0; i < analyses.length; i += batchSize) {
      batches.push(analyses.slice(i, i + batchSize));
    }

    let finalSection = null;
    const groupTitle = this.generateGroupTitle(groupPath);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      logger.info(`Обработка батча ${batchIndex + 1}/${batches.length} для группы ${groupPath}`);
      
      // Сокращаем данные для отправки
      const batchData = batch.map(analysis => ({
        name: analysis.name,
        path: analysis.path.split('/').slice(-2).join('/'), // Только последние 2 части пути
        ext: analysis.extension,
        summary: (analysis.analysis.summary || 'Нет описания').slice(0, 100), // Ограничиваем длину
        purpose: (analysis.analysis.purpose || 'Неизвестно').slice(0, 80),
        importance: analysis.analysis.importance || 1
      }));

      const prompt = `
Создайте раздел документации для модуля "${groupPath}".

${batchIndex === 0 ? 'Создайте новый раздел' : `Дополните существующий раздел (батч ${batchIndex + 1}/${batches.length})`}

${finalSection && batchIndex > 0 ? `ID текущего раздела: ${finalSection.id}\nПодразделы: ${finalSection.subsections?.map(s => s.id).join(', ')}\n` : ''}

Файлы (${batch.length} шт.):
${JSON.stringify(batchData, null, 2)}

Верните ТОЛЬКО JSON (без markdown блоков):
{
  "id": "${this.createSlug(groupPath)}",
  "title": "${groupTitle}",
  "description": "Краткое описание модуля",
  "subsections": [
    {
      "id": "короткий-id",
      "title": "Название",
      "description": "Краткое описание"
    }
  ]
}

Группируйте похожие файлы. Создавайте не более 5-7 подразделов.`;

      try {
        const sectionResult = await this.makeOpenAIRequest(prompt, `раздел ${groupPath}`, logger);
        
        if (batchIndex === 0) {
          finalSection = sectionResult;
        } else {
          // Мержим подразделы с предыдущими батчами
          this.mergeSubsections(finalSection, sectionResult);
        }

      } catch (error) {
        logger.error(`Ошибка при генерации раздела для группы ${groupPath}, батч ${batchIndex + 1}: ${error.message}`);
        
        // Создаем базовую структуру если не удалось сгенерировать
        if (!finalSection) {
          finalSection = {
            id: this.createSlug(groupPath),
            title: groupTitle,
            description: `Модуль содержит ${analyses.length} файлов`,
            subsections: []
          };
        }
      }

      // Увеличиваем задержку для больших батчей
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, analyses.length > 40 ? 2000 : 1000));
      }
    }

    return finalSection;
  }

  /**
   * Универсальный метод для запросов к OpenAI с улучшенной обработкой JSON
   */
  async makeOpenAIRequest(prompt, description, logger) {
    const systemInstruction = 'Вы технический писатель. Отвечайте ТОЛЬКО валидным JSON. Начинайте ответ с { и заканчивайте }. Не используйте markdown блоки кода. Будьте краткими.';

    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: config.openaiModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_completion_tokens: 1500,
        });

        const content = response.choices[0].message.content.trim();
        
        // Улучшенная очистка и парсинг JSON
        let jsonContent = content;
        
        // Удаляем markdown блоки если есть
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Находим первую { и последнюю }
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
          throw new Error('Не найден валидный JSON в ответе');
        }
        
        jsonContent = jsonContent.slice(firstBrace, lastBrace + 1);
        
        // Пытаемся исправить обрезанный JSON
        try {
          return JSON.parse(jsonContent);
        } catch (parseErr) {
          // Пробуем закрыть незакрытые структуры
          let fixedJson = jsonContent;
          
          // Считаем открытые скобки
          const openBrackets = (fixedJson.match(/\[/g) || []).length;
          const closeBrackets = (fixedJson.match(/\]/g) || []).length;
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          
          // Добавляем недостающие закрывающие скобки
          fixedJson += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
          fixedJson += '}'.repeat(Math.max(0, openBraces - closeBraces));
          
          // Убираем trailing comma перед закрывающими скобками
          fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
          
          return JSON.parse(fixedJson);
        }
        
      } catch (error) {
        logger.error(`Ошибка генерации ${description} (попытка ${attempt}): ${error.message}`);
        lastError = error;
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
      }
    }

    throw new Error(`Не удалось сгенерировать ${description}: ${lastError.message}`);
  }

  /**
   * Генерирует человекочитаемое название для группы на основе пути
   */
  generateGroupTitle(groupPath) {
    const parts = groupPath.split('/');
    
    // Обработка специальных случаев
    if (groupPath.endsWith('-root')) {
      const type = groupPath.replace('-root', '');
      return type === 'framework' ? 'Корневые файлы фреймворка' : 'Корневые файлы проекта';
    }
    
    // Убираем префикс типа (framework/ или source/)
    const [type, ...pathParts] = parts;
    
    if (pathParts.length === 0) {
      return type === 'framework' ? 'Фреймворк' : 'Проект';
    }
    
    // Преобразуем имя папки в человекочитаемое название
    const folderName = pathParts[pathParts.length - 1];
    const humanReadableName = this.formatFolderName(folderName);
    
    // Добавляем контекст (фреймворк или проект)
    const prefix = type === 'framework' ? 'Фреймворк' : 'Проект';
    
    // Если есть родительские папки, добавляем их для контекста
    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).map(p => this.formatFolderName(p)).join(' / ');
      return `${prefix}: ${parentPath} / ${humanReadableName}`;
    }
    
    return `${prefix}: ${humanReadableName}`;
  }

  /**
   * Форматирует имя папки в человекочитаемый вид
   */
  formatFolderName(folderName) {
    // Словарь общих сокращений и технических терминов
    const replacements = {
      'api': 'API',
      'ui': 'UI',
      'auth': 'Аутентификация',
      'utils': 'Утилиты',
      'util': 'Утилиты',
      'components': 'Компоненты',
      'component': 'Компоненты',
      'modules': 'Модули',
      'module': 'Модули',
      'services': 'Сервисы',
      'service': 'Сервисы',
      'store': 'Хранилище',
      'stores': 'Хранилища',
      'pages': 'Страницы',
      'page': 'Страницы',
      'views': 'Представления',
      'view': 'Представления',
      'models': 'Модели',
      'model': 'Модели',
      'controllers': 'Контроллеры',
      'controller': 'Контроллеры',
      'helpers': 'Помощники',
      'helper': 'Помощники',
      'config': 'Конфигурация',
      'configs': 'Конфигурации',
      'lib': 'Библиотеки',
      'libs': 'Библиотеки',
      'common': 'Общие',
      'shared': 'Общие',
      'core': 'Ядро',
      'base': 'Базовые',
      'admin': 'Администрирование',
      'orders': 'Заказы',
      'products': 'Продукты',
      'organizations': 'Организации',
      'notifications': 'Уведомления',
      'wallet': 'Кошелек',
      'reports': 'Отчеты',
      'spots': 'Точки',
      'rents': 'Аренда',
      'chats': 'Чаты',
      'events': 'События',
      'files': 'Файлы',
      'gallery': 'Галерея',
      'globals': 'Глобальные',
      'governance': 'Управление',
      'integrations': 'Интеграции',
      'landing': 'Лендинг',
      'marketplace': 'Маркетплейс',
      'music': 'Музыка',
      'inventory': 'Инвентарь',
      'community': 'Сообщество',
      'backoffice': 'Админка',
      'icons': 'Иконки',
      'builder': 'Конструктор',
      'configurator': 'Конфигуратор',
      'styles': 'Стили'
    };
    
    // Приводим к нижнему регистру для поиска
    const lowerName = folderName.toLowerCase();
    
    // Если есть точное совпадение в словаре
    if (replacements[lowerName]) {
      return replacements[lowerName];
    }
    
    // Разделяем по дефисам, подчеркиваниям и camelCase
    let words = folderName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
      .replace(/[-_]/g, ' ') // дефисы и подчеркивания на пробелы
      .split(' ')
      .filter(w => w.length > 0);
    
    // Обрабатываем каждое слово
    words = words.map(word => {
      const lowerWord = word.toLowerCase();
      if (replacements[lowerWord]) {
        return replacements[lowerWord];
      }
      // Делаем первую букву заглавной
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    return words.join(' ');
  }

  /**
   * Объединяет подразделы из разных батчей с контролем дубликатов
   */
  mergeSubsections(targetSection, sourceSection) {
    if (!sourceSection.subsections) return;
    
    if (!targetSection.subsections) {
      targetSection.subsections = [];
    }
    
    // Ограничиваем общее количество подразделов
    const maxSubsections = 10;
    
    for (const newSubsection of sourceSection.subsections) {
      if (targetSection.subsections.length >= maxSubsections) {
        logger.info(`Достигнут лимит подразделов (${maxSubsections}) для раздела ${targetSection.id}`);
        break;
      }
      
      const existingIndex = targetSection.subsections.findIndex(s => 
        s.id === newSubsection.id || 
        s.title === newSubsection.title // Проверяем также по названию
      );
      
      if (existingIndex >= 0) {
        // Обновляем существующий подраздел
        Object.assign(targetSection.subsections[existingIndex], newSubsection);
      } else {
        // Добавляем новый подраздел
        targetSection.subsections.push(newSubsection);
      }
    }
  }

  /**
   * Добавляет метаданные к структуре TOC
   */
  enrichTocWithMetadata(tocStructure) {
    tocStructure.metadata = {
      generated: new Date().toISOString(),
      version: 1,
      documentStatus: 'draft',
    };
    
    if (tocStructure.sections) {
      for (const section of tocStructure.sections) {
        this.enrichSectionWithMetadata(section);
      }
    }
  }

  /**
   * Добавляет метаданные к разделу
   */
  enrichSectionWithMetadata(section) {
    section.metadata = {
      status: 'pending',
      lastUpdated: null,
    };
    
    if (section.subsections) {
      for (const subsection of section.subsections) {
        this.enrichSectionWithMetadata(subsection);
      }
    }
  }

  /**
   * Генерирует markdown-представление оглавления
   */
  generateMarkdownToc(tocStructure, level = 0) {
    let markdown = '';
    
    if (level === 0 && tocStructure.sections) {
      markdown += '## Оглавление\n\n';
    }
    
    if (tocStructure.sections) {
      for (const section of tocStructure.sections) {
        const indent = '  '.repeat(level);
        markdown += `${indent}- [${section.title}](#${section.id})\n`;
        
        if (section.subsections && section.subsections.length > 0) {
          markdown += this.generateMarkdownToc({ sections: section.subsections }, level + 1);
        }
      }
    }
    
    if (level === 0) {
      markdown += '\n';
    }
    
    return markdown;
  }

  /**
   * Создает slug из строки
   */
  createSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Сбрасывает весь кеш TOC (для команды reset)
   */
  async resetTocCache(logger) {
    try {
      logger.info('Сброс кеша TOC');
      
      // Удаляем основной файл TOC
      try {
        await fs.unlink(this.tocMainFile);
        logger.info('Удален основной кеш TOC');
      } catch (err) {
        // Файл может не существовать
      }
      
      // Удаляем все файлы секций
      try {
        const files = await fs.readdir(this.tocSectionsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            await fs.unlink(path.join(this.tocSectionsDir, file));
          }
        }
        logger.info(`Удалено ${files.length} файлов кеша секций`);
      } catch (err) {
        // Директория может не существовать
      }
      
      return true;
    } catch (err) {
      logger.error(`Ошибка при сбросе кеша TOC: ${err.message}`);
      throw err;
    }
  }
}

export default TocGenerator;