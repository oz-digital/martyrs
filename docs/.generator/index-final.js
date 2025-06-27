import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import ProjectAnalyzer from './analyzer.js';
import config from './config.js';
import DependencyGraphBuilder from './dependencyGraphBuilder.js';
import ASTSplitter from './astSplitter.js';
import DocumentMemoryManager from './documentMemoryManager.js';
import ProjectScanner from './fileScanner.js';
import { setupLogger } from './logger.js';
import DocumentationStateManager from './stateManager.js';
import OpenAI from 'openai';
import path from 'path';

// Загружаем переменные окружения
dotenvConfig();

/**
 * Финальная версия улучшенного генератора документации
 */
class FinalDocumentationGenerator {
  constructor() {
    this.logger = setupLogger();
    this.graphBuilder = new DependencyGraphBuilder();
    this.astSplitter = new ASTSplitter();
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Генерирует документацию для проекта
   */
  async generateDocumentation(options = {}) {
    this.logger.info('🚀 Запуск финального генератора документации');
    this.logger.info(`Режим: ${options.reset ? 'сброс и полная регенерация' : 'инкрементальная генерация'}`);
    
    try {
      // Инициализация менеджера состояния
      const stateManager = new DocumentationStateManager();
      await stateManager.initialize(this.logger);
      
      if (options.reset) {
        await stateManager.resetState(this.logger);
        if (options.resetMemory) {
          const memoryManager = new DocumentMemoryManager(stateManager);
          await memoryManager.initialize(this.logger);
          await memoryManager.resetMemory(this.logger);
        }
      }
      
      // Сканирование проекта
      this.logger.info('📂 Сканирование файлов проекта...');
      const projectScanner = new ProjectScanner(stateManager);
      const files = await projectScanner.scanProject(config.projectRootDir, this.logger);
      this.logger.info(`Найдено ${files.length} файлов`);
      
      // Анализ файлов
      this.logger.info('🔍 Анализ структуры и зависимостей...');
      const projectAnalyzer = new ProjectAnalyzer(stateManager);
      const analysisResults = await projectAnalyzer.analyzeFiles(files, this.logger);
      
      // Получаем структуру проекта
      const projectStructure = stateManager.documentationState.projectStructure;
      
      // Генерация документации с новым подходом
      this.logger.info('📝 Генерация документации с улучшенным алгоритмом...');
      const documentation = await this.generateSmartDocumentation(projectStructure, config.outputPath);
      
      // Статистика
      const stats = stateManager.getDocumentationStats();
      
      this.logger.info('✅ Документация успешно сгенерирована!');
      this.logger.info(`📊 Статистика:`);
      this.logger.info(`  - Всего файлов: ${stats.totalFiles}`);
      this.logger.info(`  - Проанализировано: ${stats.filesAnalyzed}`);
      this.logger.info(`  - Покрытие: ${stats.coverage.total}%`);
      this.logger.info(`  - Выходная директория: ${config.outputPath}`);
      
      console.log('\n✅ Документация успешно сгенерирована!');
      console.log(`📁 Результаты сохранены в: ${config.outputPath}`);
      console.log(`📊 Покрытие документацией: ${stats.coverage.total}%`);
      
      return {
        success: true,
        outputPath: config.outputPath,
        stats,
      };
    } catch (err) {
      this.logger.error(`❌ Ошибка при генерации документации: ${err.message}`);
      this.logger.error(err.stack);
      console.error('❌ Ошибка при генерации документации:', err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Генерирует документацию с умным подходом
   */
  async generateSmartDocumentation(projectStructure, outputDir) {
    // 1. Строим граф зависимостей
    this.logger.info('🕸️ Построение графа зависимостей...');
    const graph = await this.graphBuilder.buildGraphFromAnalysis(projectStructure);
    this.logger.info(`  - Узлов в графе: ${graph.order}`);
    this.logger.info(`  - Рёбер (зависимостей): ${graph.size}`);
    
    // 2. Кластеризуем граф
    this.logger.info('🗂️ Кластеризация файлов по зависимостям...');
    const clusters = this.graphBuilder.clusterGraph(12);
    this.logger.info(`  - Найдено кластеров: ${clusters.length}`);
    
    // 3. Создаем семантические батчи
    this.logger.info('📦 Создание семантических батчей...');
    const batches = await this.createSemanticBatches(clusters);
    this.logger.info(`  - Создано батчей: ${batches.length}`);
    
    // 4. Генерируем документацию для каждого батча
    this.logger.info('🤖 Генерация документации для батчей...');
    const documentationParts = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.info(`  Обработка батча ${i + 1}/${batches.length}: ${batch.name}`);
      
      try {
        const doc = await this.generateBatchDocumentation(batch);
        documentationParts.push(doc);
        
        // Пауза между запросами
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        this.logger.warn(`  Ошибка в батче ${batch.name}: ${error.message}`);
      }
    }
    
    // 5. Собираем финальную документацию
    this.logger.info('📄 Сборка финальной документации...');
    const finalDoc = this.assembleFinalDocumentation(documentationParts);
    
    // 6. Сохраняем результат
    await this.saveDocumentation(finalDoc, outputDir);
    
    return finalDoc;
  }

  /**
   * Создает семантические батчи из кластеров
   */
  async createSemanticBatches(clusters) {
    const batches = [];
    const MAX_TOKENS = 8000;

    for (const cluster of clusters) {
      // Разбиваем файлы в кластере на AST части
      const astChunks = [];
      
      for (const file of cluster.files) {
        if (file.content) {
          const chunks = await this.astSplitter.splitFile(file, 4000);
          astChunks.push(...chunks);
        }
      }

      // Группируем чанки в батчи по токенам
      let currentBatch = [];
      let currentTokens = 0;
      let batchIndex = 0;

      for (const chunk of astChunks) {
        if (currentTokens + chunk.estimatedTokens > MAX_TOKENS && currentBatch.length > 0) {
          batches.push({
            id: `${cluster.id}-batch-${batchIndex}`,
            name: this.generateBatchName(cluster, batchIndex),
            files: currentBatch,
            clusterId: cluster.id,
            estimatedTokens: currentTokens
          });
          
          currentBatch = [chunk];
          currentTokens = chunk.estimatedTokens;
          batchIndex++;
        } else {
          currentBatch.push(chunk);
          currentTokens += chunk.estimatedTokens;
        }
      }

      // Добавляем последний батч
      if (currentBatch.length > 0) {
        batches.push({
          id: `${cluster.id}-batch-${batchIndex}`,
          name: this.generateBatchName(cluster, batchIndex),
          files: currentBatch,
          clusterId: cluster.id,
          estimatedTokens: currentTokens
        });
      }
    }

    return batches;
  }

  /**
   * Генерирует имя для батча
   */
  generateBatchName(cluster, index = null) {
    const fileNames = cluster.files.slice(0, 2).map(f => f.name || path.basename(f.path || ''));
    const baseName = fileNames.join(', ');
    
    if (cluster.files.length > 2) {
      return `${baseName} и ${cluster.files.length - 2} других`;
    }
    
    return index !== null ? `${baseName} (часть ${index + 1})` : baseName;
  }

  /**
   * Генерирует документацию для батча
   */
  async generateBatchDocumentation(batch) {
    const prompt = this.createEnhancedPrompt(batch);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      return {
        batchId: batch.id,
        name: batch.name,
        documentation: response.choices[0].message.content,
        files: batch.files.map(f => f.name || f.path)
      };
    } catch (error) {
      this.logger.error(`Ошибка генерации для батча ${batch.id}:`, error);
      throw error;
    }
  }

  /**
   * Создает улучшенный промпт для батча
   */
  createEnhancedPrompt(batch) {
    const fileContents = batch.files.map(file => {
      const name = file.name || path.basename(file.path || '');
      const content = file.content || '';
      const type = file.type || 'code';
      
      return `### ${name} ${type ? `(${type})` : ''}\n\`\`\`\n${content}\n\`\`\``;
    }).join('\n\n');

    return `Проанализируй следующие связанные файлы и создай структурированную техническую документацию.

Файлы в этом семантическом батче: ${batch.files.map(f => f.name || path.basename(f.path || '')).join(', ')}

${fileContents}

Создай документацию включающую:
1. **Краткое описание** - что делает этот код
2. **Архитектура** - как компоненты взаимодействуют
3. **Ключевые API** - основные функции и интерфейсы
4. **Паттерны** - используемые паттерны проектирования
5. **Примеры использования** - где это уместно

Фокусируйся на практической пользе и ясности изложения.`;
  }

  /**
   * Системный промпт
   */
  getSystemPrompt() {
    return `Ты - эксперт по созданию технической документации для современных веб-приложений.

Правила:
1. Пиши ясно и структурированно
2. Фокусируйся на архитектуре и взаимодействиях
3. Объясняй зачем, а не только что
4. Приводи практические примеры
5. Используй Markdown для форматирования
6. Группируй связанную функциональность`;
  }

  /**
   * Собирает финальную документацию
   */
  assembleFinalDocumentation(parts) {
    let documentation = '# Документация модуля products\n\n';
    documentation += '## Обзор\n\n';
    documentation += `Модуль состоит из ${parts.reduce((sum, p) => sum + p.files.length, 0)} файлов, `;
    documentation += `организованных в ${parts.length} логических групп.\n\n`;

    // Оглавление
    documentation += '## Содержание\n\n';
    parts.forEach((part, index) => {
      documentation += `${index + 1}. [${part.name}](#${this.slugify(part.name)})\n`;
    });
    documentation += '\n';

    // Содержимое частей
    parts.forEach(part => {
      documentation += `## ${part.name}\n\n`;
      documentation += part.documentation;
      documentation += '\n\n---\n\n';
    });

    return documentation;
  }

  /**
   * Создает slug для якорей
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Сохраняет документацию
   */
  async saveDocumentation(documentation, outputDir) {
    const docPath = path.join(outputDir, 'products-documentation.md');
    
    await fs.mkdir(path.dirname(docPath), { recursive: true });
    await fs.writeFile(docPath, documentation, 'utf8');
    
    this.logger.info(`📄 Документация сохранена: ${docPath}`);
  }
}

/**
 * Главная функция
 */
async function generateFinalDocumentation(options = {}) {
  const generator = new FinalDocumentationGenerator();
  return await generator.generateDocumentation(options);
}

// Обработка аргументов командной строки
async function main() {
  const args = process.argv.slice(2);
  const options = {
    reset: args.includes('--reset'),
    resetMemory: args.includes('--reset-memory'),
  };
  
  await generateFinalDocumentation(options);
}

// Запуск если вызван напрямую
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export default generateFinalDocumentation;