import crypto from 'crypto';
import { promises } from 'fs';
import path from 'path';
import config from './config.js';
// doc-generator/documentMemoryManager.js
const fs = { promises }.promises;
/**
 * Класс для управления контекстной памятью документации
 * Отвечает за:
 * - Хранение и индексирование сгенерированных документов
 * - Поиск релевантных частей документации для использования в качестве контекста
 * - Анализ и извлечение ключевых концепций из документации
 */
class DocumentMemoryManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.memoryDir = path.join(process.cwd(), config.stateDir, 'memory');
    this.docIndexFile = path.join(this.memoryDir, 'doc_index.json');
    this.conceptsFile = path.join(this.memoryDir, 'concepts.json');
    this.docsDir = path.join(this.memoryDir, 'docs');
    this.docIndex = null;
    this.conceptsMap = null;
  }
  /**
   * Инициализирует менеджер памяти документации
   */
  async initialize(logger) {
    logger.info('Инициализация менеджера памяти документации');
    try {
      // Создаем необходимые директории
      await fs.mkdir(this.memoryDir, { recursive: true });
      await fs.mkdir(this.docsDir, { recursive: true });
      // Загружаем индекс документации и карту концепций, если они существуют
      try {
        const indexContent = await fs.readFile(this.docIndexFile, 'utf8');
        this.docIndex = JSON.parse(indexContent);
        logger.info('Загружен индекс документации');
      } catch (err) {
        this.docIndex = {
          version: 1,
          lastUpdated: new Date().toISOString(),
          documents: {},
          sections: {},
          stats: {
            totalDocuments: 0,
            totalSections: 0,
            averageLength: 0,
          },
        };
        logger.info('Создан новый индекс документации');
      }
      try {
        const conceptsContent = await fs.readFile(this.conceptsFile, 'utf8');
        this.conceptsMap = JSON.parse(conceptsContent);
        logger.info('Загружена карта концепций');
      } catch (err) {
        this.conceptsMap = {
          version: 1,
          lastUpdated: new Date().toISOString(),
          concepts: {},
          relations: [],
        };
        logger.info('Создана новая карта концепций');
      }
      return true;
    } catch (err) {
      logger.error(`Ошибка при инициализации менеджера памяти: ${err.message}`);
      throw err;
    }
  }
  /**
   * Сохраняет индекс документации
   */
  async saveDocIndex() {
    this.docIndex.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.docIndexFile, JSON.stringify(this.docIndex, null, 2), 'utf8');
    return true;
  }
  /**
   * Сохраняет карту концепций
   */
  async saveConceptsMap() {
    this.conceptsMap.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.conceptsFile, JSON.stringify(this.conceptsMap, null, 2), 'utf8');
    return true;
  }
  /**
   * Сохраняет сгенерированный документ в памяти
   */
  async saveDocumentContent(sectionId, content, metadata = {}) {
    const docHash = crypto.createHash('md5').update(content).digest('hex');
    const docPath = path.join(this.docsDir, `${sectionId}-${docHash}.md`);
    // Сохраняем контент в файл
    await fs.writeFile(docPath, content, 'utf8');
    
    // Анализируем зависимости файлов для создания связей
    const dependencies = this.extractDependenciesFromMetadata(metadata);
    const relatedSections = this.findRelatedSectionsFromDependencies(dependencies);
    
    // Обновляем индекс
    this.docIndex.documents[sectionId] = {
      id: sectionId,
      path: docPath,
      hash: docHash,
      length: content.length,
      createdAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        wordCount: content.split(/\s+/).length,
        dependencies,
        relatedSections
      },
    };
    
    // Создаем связи между разделами
    this.createSectionRelations(sectionId, relatedSections, dependencies);
    
    // Обновляем статистику
    this.updateDocStats();
    // Сохраняем индекс
    await this.saveDocIndex();
    // Извлекаем и сохраняем концепции из документа
    await this.extractAndSaveConcepts(sectionId, content, metadata);
    return {
      sectionId,
      docHash,
      docPath,
      relatedSections
    };
  }
  
  /**
   * Извлекает зависимости из метаданных файлов
   */
  extractDependenciesFromMetadata(metadata) {
    const dependencies = new Set();
    
    if (metadata.fileAnalysis && Array.isArray(metadata.fileAnalysis)) {
      metadata.fileAnalysis.forEach(file => {
        if (file.dependencies && Array.isArray(file.dependencies)) {
          file.dependencies.forEach(dep => {
            // Нормализуем пути зависимостей
            const normalizedDep = this.normalizeDependencyPath(dep);
            if (normalizedDep) {
              dependencies.add(normalizedDep);
            }
          });
        }
      });
    }
    
    return Array.from(dependencies);
  }
  
  /**
   * Нормализует путь зависимости для поиска связанных разделов
   */
  normalizeDependencyPath(dependency) {
    if (!dependency || typeof dependency !== 'string') return null;
    
    // Убираем префиксы типа @martyrs/src/, ./,../
    let normalized = dependency
      .replace(/^@martyrs\/src\//, '')
      .replace(/^\.\.?\//, '')
      .replace(/\.(js|vue|ts|tsx|jsx)$/, '');
    
    // Если это относительный путь модуля, извлекаем имя модуля
    if (normalized.includes('/')) {
      const parts = normalized.split('/');
      if (parts.includes('modules')) {
        const moduleIndex = parts.indexOf('modules');
        if (moduleIndex < parts.length - 1) {
          return parts.slice(moduleIndex + 1).join('/');
        }
      }
    }
    
    return normalized;
  }
  
  /**
   * Находит связанные разделы на основе зависимостей
   */
  findRelatedSectionsFromDependencies(dependencies) {
    const relatedSections = [];
    
    // Ищем разделы, которые могут соответствовать зависимостям
    for (const [sectionId, doc] of Object.entries(this.docIndex.documents)) {
      for (const dependency of dependencies) {
        if (sectionId.includes(dependency.toLowerCase()) || 
            dependency.toLowerCase().includes(sectionId.replace(/^(source|framework)-/, ''))) {
          relatedSections.push({
            sectionId,
            dependency,
            type: 'dependency'
          });
        }
      }
    }
    
    return relatedSections;
  }
  
  /**
   * Создает связи между разделами документации
   */
  createSectionRelations(fromSectionId, relatedSections, dependencies) {
    if (!this.docIndex.sections[fromSectionId]) {
      this.docIndex.sections[fromSectionId] = {
        relations: [],
        dependencies
      };
    }
    
    // Добавляем связи на основе зависимостей
    relatedSections.forEach(relation => {
      const existingRelation = this.docIndex.sections[fromSectionId].relations.find(
        r => r.toSectionId === relation.sectionId
      );
      
      if (!existingRelation) {
        this.docIndex.sections[fromSectionId].relations.push({
          toSectionId: relation.sectionId,
          type: relation.type,
          strength: 1,
          dependency: relation.dependency
        });
      }
    });
  }
  
  /**
   * Находит связанные разделы для раздела
   */
  findRelatedSections(sectionId, maxResults = 3) {
    const section = this.docIndex.sections[sectionId];
    if (!section || !section.relations) return [];
    
    // Сортируем связи по силе и возвращаем топ-N
    return section.relations
      .sort((a, b) => (b.strength || 0) - (a.strength || 0))
      .slice(0, maxResults)
      .map(relation => ({
        sectionId: relation.toSectionId,
        type: relation.type,
        strength: relation.strength,
        dependency: relation.dependency
      }));
  }
  /**
   * Обновляет статистику индекса документации
   */
  updateDocStats() {
    const documents = Object.values(this.docIndex.documents);
    const totalLength = documents.reduce((sum, doc) => sum + doc.length, 0);
    this.docIndex.stats = {
      totalDocuments: documents.length,
      totalSections: Object.keys(this.docIndex.sections).length,
      averageLength: documents.length > 0 ? Math.round(totalLength / documents.length) : 0,
    };
  }
  /**
   * Извлекает ключевые концепции из контента документа и сохраняет их
   */
  /**
 * Извлекает ключевые концепции из контента документа и сохраняет их
 */
async extractAndSaveConcepts(sectionId, content, metadata = {}) {
  const concepts = [];
  
  // Список общих заголовков, которые НЕ являются концепциями
  const genericHeadings = [
    'основные задачи',
    'общая схема работы',
    'особенности',
    'назначение и функциональность',
    'архитектурные особенности',
    'принципы работы',
    'взаимодействие',
    'введение',
    'обзор',
    'заключение',
    'примеры использования',
    'api reference',
    'структура',
    'конфигурация',
    'установка',
    'начало работы',
    'параметры функции'
  ];
  
  // 1. Извлекаем технические термины из кода (имена компонентов, функций, классов)
  const codePatterns = [
    // Имена функций: function functionName, const functionName =, functionName() {
    /(?:function|const|let|var)\s+([A-Z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)*)\s*[=(]/g,
    // Имена классов: class ClassName
    /class\s+([A-Z][a-zA-Z0-9]+)/g,
    // Экспорты: export { ComponentName }, export default ComponentName
    /export\s+(?:default\s+)?(?:\{[^}]*\}|([A-Z][a-zA-Z0-9]+))/g,
    // React компоненты в JSX: <ComponentName
    /<([A-Z][a-zA-Z0-9]+)/g,
    // Импорты специфичных вещей: import { Something }
    /import\s+\{([^}]+)\}/g,
    // Методы объектов с camelCase: object.methodName(
    /\.([a-z][a-zA-Z0-9]+)\s*\(/g,
    // Хуки и специальные функции: useEffect, useState, createContext
    /\b(use[A-Z][a-zA-Z0-9]+|create[A-Z][a-zA-Z0-9]+|handle[A-Z][a-zA-Z0-9]+)\b/g
  ];
  
  for (const pattern of codePatterns) {
    const matches = [...content.matchAll(pattern)];
    for (const match of matches) {
      const concept = match[1];
      if (concept && concept.length > 3 && !concepts.includes(concept)) {
        concepts.push(concept);
      }
    }
  }
  
  // 2. Извлекаем технические термины из текста
  const technicalTermPatterns = [
    // Аббревиатуры: SSR, HMR, API, etc.
    /\b([A-Z]{2,})\b/g,
    // Составные технические термины: hot-reloading, server-side
    /\b([a-z]+(?:-[a-z]+)+)\b/g,
    // Имена файлов и модулей
    /\b([a-zA-Z0-9]+\.(js|jsx|ts|tsx|vue|css|scss))\b/g,
    // Пути к модулям
    /['"]([.\/a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)['"]/g
  ];
  
  for (const pattern of technicalTermPatterns) {
    const matches = [...content.matchAll(pattern)];
    for (const match of matches) {
      const term = match[1];
      if (term && !concepts.includes(term) && term.length > 2) {
        // Фильтруем общие слова
        const commonWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that'];
        if (!commonWords.includes(term.toLowerCase())) {
          concepts.push(term);
        }
      }
    }
  }
  
  // 3. Если есть метаданные с информацией из анализа файлов, добавляем их
  if (metadata.fileAnalysis) {
    for (const file of metadata.fileAnalysis) {
      // Добавляем имена компонентов
      if (file.components) {
        for (const component of file.components) {
          if (component.name && !concepts.includes(component.name)) {
            concepts.push(component.name);
          }
        }
      }
      
      // Добавляем имена функций
      if (file.functions) {
        for (const func of file.functions) {
          if (func.name && !concepts.includes(func.name)) {
            concepts.push(func.name);
          }
        }
      }
      
      // Добавляем зависимости как концепции
      if (file.dependencies) {
        for (const dep of file.dependencies) {
          const depName = dep.split('/').pop(); // Берем последнюю часть пути
          if (depName && !concepts.includes(depName)) {
            concepts.push(depName);
          }
        }
      }
    }
  }
  
  // 4. Извлекаем ТОЛЬКО технические заголовки (игнорируя общие)
  const headingRegex = /##\s+(.*?)$|###\s+(.*?)$/gm;
  const headingMatches = [...content.matchAll(headingRegex)];
  
  for (const match of headingMatches) {
    const heading = (match[1] || match[2]).trim().toLowerCase();
    
    // Проверяем, не является ли это общим заголовком
    const isGeneric = genericHeadings.some(generic => 
      heading.includes(generic) || generic.includes(heading)
    );
    
    if (!isGeneric) {
      // Проверяем, содержит ли заголовок технические термины
      const hasCode = /[A-Z][a-zA-Z0-9]*|[a-z]+[A-Z]/.test(match[1] || match[2]);
      const hasSpecialChars = /[(){}[\]<>]/.test(match[1] || match[2]);
      
      if (hasCode || hasSpecialChars) {
        const originalHeading = match[1] || match[2];
        if (!concepts.includes(originalHeading)) {
          concepts.push(originalHeading);
        }
      }
    }
  }
  
  // Удаляем дубликаты и фильтруем слишком короткие концепции
  const uniqueConcepts = [...new Set(concepts)]
    .filter(concept => concept.length > 2)
    .slice(0, 50); // Ограничиваем количество концепций
  
  // Добавляем концепции в карту
  for (const concept of uniqueConcepts) {
    const conceptKey = concept.toLowerCase().trim();
    
    if (!this.conceptsMap.concepts[conceptKey]) {
      this.conceptsMap.concepts[conceptKey] = {
        name: concept,
        type: this.detectConceptType(concept),
        occurrences: [],
        frequency: 0,
      };
    }
    
    // Добавляем информацию о появлении концепции в данном разделе
    this.conceptsMap.concepts[conceptKey].occurrences.push({
      sectionId,
      timestamp: new Date().toISOString(),
    });
    
    this.conceptsMap.concepts[conceptKey].frequency = 
      this.conceptsMap.concepts[conceptKey].occurrences.length;
  }
  
  // Обновляем отношения между разделами на основе общих концепций
  this.updateSectionRelations(sectionId, uniqueConcepts);
  
  // Сохраняем карту концепций
  await this.saveConceptsMap();
  
  return uniqueConcepts;
}

/**
 * Определяет тип концепции
 */
detectConceptType(concept) {
  // Функция или метод
  if (/^(use|create|handle|get|set|update|delete|fetch|render|init|load)[A-Z]/.test(concept)) {
    return 'function';
  }
  
  // React компонент
  if (/^[A-Z][a-zA-Z0-9]*Component$|^[A-Z][a-zA-Z0-9]*(?:View|Modal|Button|List)$/.test(concept)) {
    return 'component';
  }
  
  // Класс
  if (/^[A-Z][a-zA-Z0-9]+(?:Manager|Service|Controller|Handler|Builder)$/.test(concept)) {
    return 'class';
  }
  
  // Файл
  if (/\.(js|jsx|ts|tsx|vue|css|scss)$/.test(concept)) {
    return 'file';
  }
  
  // Аббревиатура
  if (/^[A-Z]{2,}$/.test(concept)) {
    return 'abbreviation';
  }
  
  // Составной термин
  if (/-/.test(concept)) {
    return 'compound-term';
  }
  
  return 'term';
}
/**
 * Сохраняет сгенерированный документ в памяти
 */
async saveDocumentContent(sectionId, content, metadata = {}) {
  const docHash = crypto.createHash('md5').update(content).digest('hex');
  const docPath = path.join(this.docsDir, `${sectionId}-${docHash}.md`);
  
  // Сохраняем контент в файл
  await fs.writeFile(docPath, content, 'utf8');
  
  // Обновляем индекс
  this.docIndex.documents[sectionId] = {
    id: sectionId,
    path: docPath,
    hash: docHash,
    length: content.length,
    createdAt: new Date().toISOString(),
    metadata: {
      ...metadata,
      wordCount: content.split(/\s+/).length,
    },
  };
  
  // Обновляем статистику
  this.updateDocStats();
  
  // Сохраняем индекс
  await this.saveDocIndex();
  
  // Извлекаем и сохраняем концепции из документа
  // Передаем метаданные, включая информацию об анализе файлов
  await this.extractAndSaveConcepts(sectionId, content, metadata);
  
  return {
    sectionId,
    docHash,
    docPath,
  };
}
  /**
   * Обновляет отношения между разделами на основе общих концепций
   */
  updateSectionRelations(sectionId, concepts) {
    const conceptKeys = concepts.map(c => c.toLowerCase().trim());
    // Находим все разделы, которые имеют общие концепции с текущим
    for (const otherSectionId in this.docIndex.documents) {
      if (otherSectionId === sectionId) continue;
      // Проверяем каждую концепцию текущего раздела
      for (const conceptKey of conceptKeys) {
        if (this.conceptsMap.concepts[conceptKey]) {
          const occurrences = this.conceptsMap.concepts[conceptKey].occurrences;
          // Если концепция встречается в другом разделе
          if (occurrences.some(o => o.sectionId === otherSectionId)) {
            // Добавляем отношение между разделами
            const relationExists = this.conceptsMap.relations.some(r => (r.source === sectionId && r.target === otherSectionId) || (r.source === otherSectionId && r.target === sectionId));
            if (!relationExists) {
              this.conceptsMap.relations.push({
                source: sectionId,
                target: otherSectionId,
                type: 'shared-concept',
                conceptKey,
                strength: 1,
                createdAt: new Date().toISOString(),
              });
            } else {
              // Усиливаем существующее отношение
              const relation = this.conceptsMap.relations.find(r => (r.source === sectionId && r.target === otherSectionId) || (r.source === otherSectionId && r.target === sectionId));
              relation.strength += 1;
              relation.updatedAt = new Date().toISOString();
            }
          }
        }
      }
    }
  }
  /**
   * Находит релевантные разделы документации для данного контекста
   */
  async findRelevantDocuments(context, maxResults = 3) {
    // Простой подход на основе ключевых слов
    const keywords = this.extractKeywords(context);
    // Оценка релевантности для каждого документа
    const relevanceScores = [];
    for (const docId in this.docIndex.documents) {
      const docInfo = this.docIndex.documents[docId];
      try {
        // Загружаем содержимое документа
        const content = await fs.readFile(docInfo.path, 'utf8');
        // Вычисляем релевантность на основе ключевых слов
        let score = 0;
        for (const keyword of keywords) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = content.match(regex);
          if (matches) {
            score += matches.length;
          }
        }
        if (score > 0) {
          relevanceScores.push({
            docId,
            score,
            docInfo,
          });
        }
      } catch (err) {
        console.error(`Ошибка при загрузке документа ${docId}: ${err.message}`);
      }
    }
    // Сортируем по релевантности и возвращаем лучшие результаты
    relevanceScores.sort((a, b) => b.score - a.score);
    // Загружаем контент для лучших результатов
    const results = [];
    for (const item of relevanceScores.slice(0, maxResults)) {
      try {
        const content = await fs.readFile(item.docInfo.path, 'utf8');
        results.push({
          docId: item.docId,
          score: item.score,
          content,
        });
      } catch (err) {
        console.error(`Ошибка при загрузке документа ${item.docId}: ${err.message}`);
      }
      if (results.length >= maxResults) break;
    }
    return results;
  }
  /**
   * Извлекает ключевые слова из контекста
   */
  extractKeywords(context) {
    // Простое извлечение ключевых слов (слова длиннее 4 символов, не из стоп-листа)
    const stopWords = ['если', 'того', 'этот', 'тогда', 'также', 'таким', 'образом', 'чтобы', 'через', 'который'];
    return context
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4 && !stopWords.includes(word))
      .slice(0, 20); // Берем максимум 20 ключевых слов
  }
  /**
   * Находит разделы, связанные с данным разделом
   */
  findRelatedSections(sectionId, maxResults = 3) {
    const relations = this.conceptsMap.relations.filter(r => r.source === sectionId || r.target === sectionId).sort((a, b) => b.strength - a.strength);
    return relations.slice(0, maxResults).map(r => {
      const relatedSectionId = r.source === sectionId ? r.target : r.source;
      return {
        sectionId: relatedSectionId,
        strength: r.strength,
        conceptKey: r.conceptKey,
      };
    });
  }
  /**
   * Получает контент документа по ID раздела
   */
  async getDocumentContent(sectionId) {
    if (this.docIndex.documents[sectionId]) {
      try {
        return await fs.readFile(this.docIndex.documents[sectionId].path, 'utf8');
      } catch (err) {
        console.error(`Ошибка при загрузке документа ${sectionId}: ${err.message}`);
        return null;
      }
    }
    return null;
  }
  /**
   * Загружает и индексирует существующие файлы документации
   */
  async importExistingDocumentation(docsPath, logger) {
    logger.info(`Импорт существующей документации из ${docsPath}`);
    try {
      // Проверяем существование директории
      const stats = await fs.stat(docsPath);
      if (!stats.isDirectory()) {
        logger.error(`${docsPath} не является директорией`);
        return false;
      }
      // Получаем список файлов
      const files = await fs.readdir(docsPath);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      logger.info(`Найдено ${mdFiles.length} markdown-файлов`);
      // Импортируем каждый файл
      for (const file of mdFiles) {
        const filePath = path.join(docsPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        // Генерируем ID раздела на основе имени файла
        const sectionId = path
          .basename(file, '.md')
          .replace(/[^a-z0-9-]/gi, '-')
          .toLowerCase();
        // Извлекаем заголовок из контента
        const titleMatch = content.match(/^#\s+(.*?)$/m);
        const title = titleMatch ? titleMatch[1] : sectionId;
        // Сохраняем документ
        await this.saveDocumentContent(sectionId, content, {
          title,
          imported: true,
          originalPath: filePath,
        });
        logger.info(`Импортирован файл: ${file} => ${sectionId}`);
      }
      return true;
    } catch (err) {
      logger.error(`Ошибка при импорте документации: ${err.message}`);
      return false;
    }
  }
  /**
   * Получает статистику о памяти документации
   */
  getMemoryStats() {
    return {
      totalDocuments: this.docIndex.stats.totalDocuments,
      totalSections: this.docIndex.stats.totalSections,
      averageLength: this.docIndex.stats.averageLength,
      totalConcepts: Object.keys(this.conceptsMap.concepts).length,
      totalRelations: this.conceptsMap.relations.length,
    };
  }
  /**
   * Возвращает статистику памяти документации
   */
  getMemoryStats() {
    const documents = Object.values(this.docIndex.documents);
    const sections = Object.values(this.docIndex.sections);
    const concepts = Object.keys(this.conceptsMap.concepts);
    
    // Подсчитываем общее количество связей
    const totalRelations = sections.reduce((sum, section) => {
      return sum + (section.relations ? section.relations.length : 0);
    }, 0);
    
    // Подсчитываем связи по типам
    const relationsByType = {};
    sections.forEach(section => {
      if (section.relations) {
        section.relations.forEach(relation => {
          relationsByType[relation.type] = (relationsByType[relation.type] || 0) + 1;
        });
      }
    });
    
    return {
      totalDocuments: documents.length,
      totalSections: sections.length,
      totalConcepts: concepts.length,
      totalRelations,
      relationsByType,
      averageDocLength: this.docIndex.stats.averageLength,
      memorySize: documents.reduce((sum, doc) => sum + doc.length, 0),
      lastUpdated: this.docIndex.lastUpdated
    };
  }
  
  /**
   * Сбрасывает память документации
   */
  async resetMemory(logger) {
    logger.info('Сброс памяти документации');
    try {
      // Удаляем все файлы документов
      const docFiles = await fs.readdir(this.docsDir);
      for (const file of docFiles) {
        await fs.unlink(path.join(this.docsDir, file));
      }
      // Сбрасываем индексы
      this.docIndex = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        documents: {},
        sections: {},
        stats: {
          totalDocuments: 0,
          totalSections: 0,
          averageLength: 0,
        },
      };
      this.conceptsMap = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        concepts: {},
        relations: [],
      };
      // Сохраняем пустые индексы
      await this.saveDocIndex();
      await this.saveConceptsMap();
      logger.info('Память документации успешно сброшена');
      return true;
    } catch (err) {
      logger.error(`Ошибка при сбросе памяти документации: ${err.message}`);
      throw err;
    }
  }
}
export default DocumentMemoryManager;
