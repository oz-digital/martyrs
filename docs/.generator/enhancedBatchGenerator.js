import { promises as fs } from 'fs';
import path from 'path';
import DependencyGraphBuilder from './dependencyGraphBuilder.js';
import ASTSplitter from './astSplitter.js';
import OpenAI from 'openai';

/**
 * Улучшенный генератор батчей документации
 */
class EnhancedBatchGenerator {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.graphBuilder = new DependencyGraphBuilder();
    this.astSplitter = new ASTSplitter();
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Генерирует документацию для модуля
   */
  async generateModuleDocumentation(modulePath, projectStructure, outputDir) {
    this.logger.info(`Генерация документации для модуля: ${modulePath}`);

    // 1. Строим граф зависимостей из уже проанализированных файлов
    const graph = await this.graphBuilder.buildGraphFromAnalysis(projectStructure);
    await this.graphBuilder.enrichWithFileInfo(projectStructure);
    
    // 2. Кластеризуем граф
    const clusters = this.graphBuilder.clusterGraph(15);
    this.logger.info(`Найдено ${clusters.length} кластеров`);

    // 3. Создаем батчи для документации
    const batches = await this.createSmartBatches(clusters);
    this.logger.info(`Создано ${batches.length} батчей для обработки`);

    // 4. Генерируем документацию для каждого батча
    const documentationParts = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.info(`Обработка батча ${i + 1}/${batches.length}: ${batch.name}`);
      
      const doc = await this.generateBatchDocumentation(batch);
      documentationParts.push(doc);
      
      // Пауза между запросами
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 5. Генерируем финальную документацию
    const finalDoc = await this.generateFinalDocumentation(documentationParts, modulePath);
    
    // 6. Сохраняем результат
    await this.saveDocumentation(finalDoc, outputDir, modulePath);
    
    return finalDoc;
  }

  /**
   * Создает умные батчи с учетом AST
   */
  async createSmartBatches(clusters) {
    const batches = [];
    const MAX_TOKENS_PER_BATCH = 8000;

    for (const cluster of clusters) {
      // Проверяем размер кластера
      let clusterTokens = 0;
      const enrichedFiles = [];

      for (const file of cluster.files) {
        if (file.content) {
          const chunks = await this.astSplitter.splitFile(file);
          enrichedFiles.push(...chunks);
          clusterTokens += chunks.reduce((sum, chunk) => sum + chunk.estimatedTokens, 0);
        }
      }

      // Если кластер помещается целиком
      if (clusterTokens <= MAX_TOKENS_PER_BATCH) {
        batches.push({
          id: `batch-${batches.length}`,
          name: this.generateBatchName(cluster),
          files: enrichedFiles,
          type: 'cluster',
          clusterId: cluster.id,
          estimatedTokens: clusterTokens
        });
      } else {
        // Разбиваем на подбатчи
        const subBatches = this.splitIntoBatches(enrichedFiles, MAX_TOKENS_PER_BATCH, cluster);
        batches.push(...subBatches);
      }
    }

    return this.optimizeBatches(batches);
  }

  /**
   * Разбивает файлы на батчи по токенам
   */
  splitIntoBatches(files, maxTokens, cluster) {
    const batches = [];
    let currentBatch = [];
    let currentTokens = 0;

    for (const file of files) {
      if (currentTokens + file.estimatedTokens > maxTokens && currentBatch.length > 0) {
        batches.push({
          id: `batch-${cluster.id}-${batches.length}`,
          name: this.generateBatchName(cluster, batches.length),
          files: currentBatch,
          type: 'partial-cluster',
          clusterId: cluster.id,
          estimatedTokens: currentTokens
        });
        currentBatch = [file];
        currentTokens = file.estimatedTokens;
      } else {
        currentBatch.push(file);
        currentTokens += file.estimatedTokens;
      }
    }

    if (currentBatch.length > 0) {
      batches.push({
        id: `batch-${cluster.id}-${batches.length}`,
        name: this.generateBatchName(cluster, batches.length),
        files: currentBatch,
        type: 'partial-cluster',
        clusterId: cluster.id,
        estimatedTokens: currentTokens
      });
    }

    return batches;
  }

  /**
   * Оптимизирует батчи, объединяя маленькие
   */
  optimizeBatches(batches) {
    const optimized = [];
    const small = batches.filter(b => b.estimatedTokens < 2000);
    const normal = batches.filter(b => b.estimatedTokens >= 2000);

    // Добавляем обычные батчи
    optimized.push(...normal);

    // Объединяем маленькие батчи
    let currentMerged = null;
    for (const batch of small) {
      if (!currentMerged || currentMerged.estimatedTokens + batch.estimatedTokens > 8000) {
        currentMerged = {
          id: `merged-${optimized.length}`,
          name: 'Объединенные компоненты',
          files: [...batch.files],
          type: 'merged',
          estimatedTokens: batch.estimatedTokens
        };
        optimized.push(currentMerged);
      } else {
        currentMerged.files.push(...batch.files);
        currentMerged.estimatedTokens += batch.estimatedTokens;
      }
    }

    return optimized;
  }

  /**
   * Генерирует имя для батча
   */
  generateBatchName(cluster, index = null) {
    const fileNames = cluster.files.slice(0, 3).map(f => 
      typeof f === 'string' ? path.basename(f) : f.name
    );
    
    const baseName = fileNames.join(', ');
    if (cluster.files.length > 3) {
      return `${baseName} и еще ${cluster.files.length - 3} файлов`;
    }
    
    return index !== null ? `${baseName} (часть ${index + 1})` : baseName;
  }

  /**
   * Генерирует документацию для батча
   */
  async generateBatchDocumentation(batch) {
    const prompt = this.createBatchPrompt(batch);
    
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
        temperature: 0.3,
        max_tokens: 4000
      });

      const content = response.choices[0].message.content;
      
      // Улучшаем документацию вторым проходом
      const improvedDoc = await this.improveDocumentation(content, batch);
      
      return {
        batchId: batch.id,
        name: batch.name,
        type: batch.type,
        documentation: improvedDoc,
        files: batch.files.map(f => f.name || f.path)
      };
    } catch (error) {
      this.logger.error(`Ошибка при генерации документации для батча ${batch.id}:`, error);
      throw error;
    }
  }

  /**
   * Создает промпт для батча
   */
  createBatchPrompt(batch) {
    const fileContents = batch.files.map(file => {
      const name = file.name || path.basename(file.path);
      const content = file.content || '';
      return `### Файл: ${name}\n\`\`\`\n${content}\n\`\`\``;
    }).join('\n\n');

    return `Проанализируй следующие файлы и создай подробную техническую документацию.

Файлы в этом батче: ${batch.files.map(f => f.name || path.basename(f.path)).join(', ')}

${fileContents}

Создай документацию, включающую:
1. Краткое описание функциональности
2. Архитектуру и взаимодействие компонентов
3. Ключевые API и интерфейсы
4. Примеры использования
5. Зависимости и связи с другими модулями`;
  }

  /**
   * Системный промпт для генерации документации
   */
  getSystemPrompt() {
    return `Ты - эксперт по созданию технической документации для JavaScript/TypeScript проектов.
Твоя задача - анализировать код и создавать понятную, структурированную документацию.

Правила:
1. Фокусируйся на публичном API и основной функциональности
2. Объясняй архитектурные решения и паттерны
3. Приводи примеры использования где это уместно
4. Используй Markdown для форматирования
5. Будь точным и конкретным
6. Группируй связанную функциональность`;
  }

  /**
   * Улучшает документацию вторым проходом
   */
  async improveDocumentation(initialDoc, batch) {
    const improvePrompt = `Улучши и дополни эту документацию, сделав её более структурированной и полезной:

${initialDoc}

Убедись что:
1. Все важные компоненты описаны
2. Есть четкая структура с заголовками
3. Примеры кода корректны
4. Описаны все важные зависимости`;

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
            content: improvePrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.warn('Не удалось улучшить документацию, используем исходную версию');
      return initialDoc;
    }
  }

  /**
   * Генерирует финальную документацию из частей
   */
  async generateFinalDocumentation(parts, modulePath) {
    const moduleName = path.basename(modulePath);
    
    // Группируем части по типу
    const clusters = parts.filter(p => p.type === 'cluster');
    const partialClusters = parts.filter(p => p.type === 'partial-cluster');
    const merged = parts.filter(p => p.type === 'merged');

    // Создаем структуру документации
    let documentation = `# Документация модуля ${moduleName}\n\n`;
    documentation += `## Обзор\n\n`;
    documentation += `Модуль состоит из ${parts.reduce((sum, p) => sum + p.files.length, 0)} файлов.\n\n`;

    // Добавляем оглавление
    documentation += `## Содержание\n\n`;
    parts.forEach((part, index) => {
      documentation += `${index + 1}. [${part.name}](#${this.slugify(part.name)})\n`;
    });
    documentation += '\n';

    // Добавляем документацию каждой части
    parts.forEach(part => {
      documentation += `## ${part.name}\n\n`;
      documentation += part.documentation;
      documentation += '\n\n---\n\n';
    });

    return documentation;
  }

  /**
   * Создает slug из текста для якорей
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
  async saveDocumentation(documentation, outputDir, modulePath) {
    const moduleName = path.basename(modulePath);
    const docPath = path.join(outputDir, `${moduleName}.md`);
    
    await fs.mkdir(path.dirname(docPath), { recursive: true });
    await fs.writeFile(docPath, documentation, 'utf8');
    
    this.logger.info(`Документация сохранена: ${docPath}`);
  }
}

export default EnhancedBatchGenerator;