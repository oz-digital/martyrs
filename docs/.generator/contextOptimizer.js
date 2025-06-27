import { OpenAI } from 'openai';
import config from './config.js';
import { tokenize } from './utils.js';
/**
 * Класс для оптимизации контекста и запросов к ChatGPT
 * Отвечает за:
 * - Формирование оптимальных промптов с учетом контекста
 * - Управление токенами для эффективного использования API
 * - Разделение длинных промптов на части
 * - Использование техник retrieval и continuation для больших контекстов
 */
class ContextOptimizer {
  constructor(memoryManager) {
    this.memoryManager = memoryManager;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      organization: config.openaiOrkKey,
    });
    // Настройки оптимизации контекста
    this.settings = {
      maxContextTokens: config.maxContextTokens || 4000,
      maxNewTokens: config.maxNewTokens || 1500,
      minTokensForSummary: config.minTokensForSummary || 1000,
      useSystemPrompt: config.useSystemPrompt !== false,
      maxRelatedDocuments: config.maxRelatedDocuments || 3,
      useContinuation: config.useContinuation !== false,
    };
  }
  /**
   * Токенизирует текст (оценка количества токенов)
   */
  estimateTokenCount(text) {
    return tokenize(text).length;
  }
  /**
   * Оптимизирует промпт для ChatGPT с учетом релевантного контекста
   */
  async optimizePrompt(prompt, context = {}, logger) {
    const { sectionId, sectionType, sectionTitle, tocStructure, fileAnalysis } = context;
    // Шаг 1: Оцениваем базовый размер промпта (в токенах)
    const basePromptTokens = this.estimateTokenCount(prompt);
    logger.info(`Базовый размер промпта: ${basePromptTokens} токенов`);
    // Шаг 2: Находим релевантные документы из памяти
    let relevantDocs = [];
    if (sectionId && this.memoryManager) {
      relevantDocs = await this.memoryManager.findRelevantDocuments(`${sectionTitle} ${prompt}`, this.settings.maxRelatedDocuments);
      logger.info(`Найдено ${relevantDocs.length} релевантных документов`);
    }
    // Шаг 3: Находим связанные разделы из TOC
    let relatedSections = [];
    if (sectionId && this.memoryManager && tocStructure) {
      relatedSections = this.memoryManager.findRelatedSections(sectionId, this.settings.maxRelatedDocuments);
      logger.info(`Найдено ${relatedSections.length} связанных разделов`);
    }
    // Шаг 4: Строим контекст на основе релевантных документов
    let contextContent = '';
    let usedTokens = 0;
    const availableTokens = this.settings.maxContextTokens - basePromptTokens - 200; // 200 токенов запаса
    if (relevantDocs.length > 0 || relatedSections.length > 0) {
      contextContent += `\n\nДля помощи в генерации документации предоставляю контекст из связанных разделов:\n\n`;
      // Добавляем релевантные документы
      
      for (const doc of relevantDocs) {
        const docContentTokens = this.estimateTokenCount(doc.content);
        if (usedTokens + docContentTokens <= availableTokens) {
          contextContent += `--- Из раздела "${doc.docId}" ---\n${doc.content}\n\n`;
          usedTokens += docContentTokens;
        } else {
          // Если документ слишком большой, добавляем его сокращенную версию
          const summarizedContent = await this.summarizeContent(doc.content, logger);
          const summaryTokens = this.estimateTokenCount(summarizedContent);
          if (usedTokens + summaryTokens <= availableTokens) {
            contextContent += `--- Краткое содержание раздела "${doc.docId}" ---\n${summarizedContent}\n\n`;
            usedTokens += summaryTokens;
          } else {
            logger.info(`Пропускаем документ ${doc.docId} из-за ограничений токенов`);
          }
        }
      }
      // Добавляем информацию о связанных разделах
      if (relatedSections.length > 0 && usedTokens < availableTokens) {
        contextContent += `\nСвязанные разделы:\n`;
        for (const section of relatedSections) {
          const sectionContent = await this.memoryManager.getDocumentContent(section.sectionId);
          if (sectionContent) {
            // Извлекаем только первый абзац для краткости
            const firstParagraph = sectionContent.split('\n\n')[0];
            const paragraphTokens = this.estimateTokenCount(firstParagraph);
            if (usedTokens + paragraphTokens <= availableTokens) {
              contextContent += `- ${section.sectionId}: ${firstParagraph}\n`;
              usedTokens += paragraphTokens;
            }
          }
        }
      }
    }
    // Шаг 5: Добавляем контекст файлов, если он есть
    if (fileAnalysis && usedTokens < availableTokens) {
      const fileAnalysisText = JSON.stringify(fileAnalysis, null, 2);
      const fileTokens = this.estimateTokenCount(fileAnalysisText);
      if (usedTokens + fileTokens <= availableTokens) {
        contextContent += `\n\nАнализ файлов для этого раздела:\n${fileAnalysisText}\n\n`;
        usedTokens += fileTokens;
      } else {
        logger.info(`Пропускаем детальный анализ файлов из-за ограничений токенов`);
        // Добавляем только самые важные файлы
        const importantFiles = fileAnalysis
          .filter(file => file.importance >= 4)
          .map(file => ({
            name: file.name,
            summary: file.summary,
            purpose: file.purpose,
          }));
        const importantFilesText = JSON.stringify(importantFiles, null, 2);
        const importantTokens = this.estimateTokenCount(importantFilesText);
        if (usedTokens + importantTokens <= availableTokens) {
          contextContent += `\n\nАнализ ключевых файлов для этого раздела:\n${importantFilesText}\n\n`;
          usedTokens += importantTokens;
        }
      }
    }
    // Шаг 6: Финализируем оптимизированный промпт
    const optimizedPrompt = contextContent
      ? `${prompt}\n${contextContent}\n\nИспользуйте предоставленный контекст для создания качественной и последовательной документации. Ваш ответ должен быть форматирован как Markdown.`
      : `${prompt}\n\nВаш ответ должен быть форматирован как Markdown.`;
    logger.info(`Оптимизированный промпт: ${this.estimateTokenCount(optimizedPrompt)} токенов`);
    return {
      optimizedPrompt,
      tokens: this.estimateTokenCount(optimizedPrompt),
      usedContext: !!contextContent,
      contextSources: {
        relevantDocs: relevantDocs.map(d => d.docId),
        relatedSections: relatedSections.map(s => s.sectionId),
      },
    };
  }
  /**
   * Суммирует большой контент для уменьшения размера
   */
  async summarizeContent(content, logger) {
    // Если контент небольшой, возвращаем его как есть
    if (this.estimateTokenCount(content) < this.settings.minTokensForSummary) {
      return content;
    }
    logger.info(`Суммирование большого контента (${this.estimateTokenCount(content)} токенов)`);
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openaiModel,
        messages: [
          {
            role: 'system',
            content: 'Вы помощник, который кратко суммирует технические документы.',
          },
          {
            role: 'user',
            content: `Суммируйте следующий контент, сохраняя ключевые технические детали и концепции (не более 200 слов):\n\n${content}`,
          },
        ],
        temperature: 0,
        max_completion_tokens: 350,
      });
      return response.choices[0].message.content;
    } catch (err) {
      logger.error(`Ошибка при суммировании контента: ${err.message}`);
      // Если не удалось суммировать через API, делаем простое сокращение
      const paragraphs = content.split('\n\n');
      return [
        paragraphs[0], // Первый абзац (обычно самый важный)
        '...',
        paragraphs[paragraphs.length - 1], // Последний абзац (обычно содержит выводы)
      ].join('\n\n');
    }
  }
  /**
   * Отправляет запрос к ChatGPT с оптимизированным контекстом
   */
  async sendToChatGPT(optimizedPrompt, logger, systemPrompt = null) {
    try {
      const messages = [];
      if (!systemPrompt) systemPrompt = `Вы технический писатель, который создает ТОЧНУЮ документацию строго на основе предоставленного анализа кода. 
      ВАЖНО: 
      - НЕ добавляйте информацию, которой нет в анализе
      - НЕ используйте общие фразы про технологии
      - ВСЕГДА ссылайтесь на конкретные компоненты и функции из анализа
      - Если информации недостаточно, укажите это явно`;
      // Добавляем системный промпт, если он указан
      if (this.settings.useSystemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt || 'Вы опытный технический писатель, составляющий подробную документацию для разработчиков.',
        });
      }
      // Добавляем основной промпт
      messages.push({ role: 'user', content: optimizedPrompt });
      const response = await this.openai.chat.completions.create({
        model: config.openaiModel,
        messages,
        temperature: 0,
        max_completion_tokens: this.settings.maxNewTokens,
      });
      return response.choices[0].message.content;
    } catch (err) {
      logger.error(`Ошибка при запросе к ChatGPT: ${err.message}`);
      // Если ошибка связана с превышением лимита токенов, пробуем уменьшить контекст
      if (err.message.includes('maximum context length') || err.message.includes('tokens')) {
        logger.info('Попытка запроса с уменьшенным контекстом');
        // Уменьшаем промпт и пробуем снова
        const shortenedPrompt = optimizedPrompt.split('\n\n').slice(0, 3).join('\n\n') + '\n\n[Контекст сокращен из-за ограничений токенов]\n\n' + optimizedPrompt.split('\n\n').slice(-2).join('\n\n');
        const messages = [
          {
            role: 'system',
            content: systemPrompt || 'Вы опытный технический писатель, составляющий документацию.',
          },
          { role: 'user', content: shortenedPrompt },
        ];
        const response = await this.openai.chat.completions.create({
          model: config.openaiModel,
          messages,
          temperature: 0,
          max_completion_tokens: this.settings.maxNewTokens,
        });
        return response.choices[0].message.content;
      }
      throw err;
    }
  }
  
  /**
   * Валидирует сгенерированный контент против анализа файлов
   */
  async validateGeneratedContent(content, fileAnalysis, logger) {
    const errors = [];
    const warnings = [];
    
    if (!content || content.trim().length < 50) {
      errors.push('Контент слишком короткий или пустой');
      return { valid: false, errors, warnings };
    }
    
    // Извлекаем все реальные компоненты, функции и т.д. из анализа
    const realComponents = new Set();
    const realFunctions = new Set();
    const realFiles = new Set();
    
    fileAnalysis.forEach(file => {
      realFiles.add(file.name);
      
      if (file.components && Array.isArray(file.components)) {
        file.components.forEach(comp => {
          if (comp.name) realComponents.add(comp.name);
        });
      }
      
      if (file.functions && Array.isArray(file.functions)) {
        file.functions.forEach(func => {
          if (func.name) realFunctions.add(func.name);
        });
      }
    });
    
    // Проверяем упоминания компонентов в контенте
    const componentPattern = /(?:компонент|component)\s+`?(\w+)`?/gi;
    const functionPattern = /(?:функци[яи]|function|метод|method)\s+`?(\w+)`?/gi;
    
    let match;
    const mentionedComponents = new Set();
    const mentionedFunctions = new Set();
    
    // Ищем упомянутые компоненты
    while ((match = componentPattern.exec(content)) !== null) {
      const componentName = match[1];
      mentionedComponents.add(componentName);
      
      // Проверяем, существует ли такой компонент
      if (!realComponents.has(componentName) && 
          !['MainComponent', 'ListComponent', 'DetailComponent', 'Component', 'App'].includes(componentName)) {
        warnings.push(`Упомянут несуществующий компонент: ${componentName}`);
      }
    }
    
    // Ищем упомянутые функции
    while ((match = functionPattern.exec(content)) !== null) {
      const functionName = match[1];
      mentionedFunctions.add(functionName);
      
      // Проверяем, существует ли такая функция
      if (!realFunctions.has(functionName) && 
          !['render', 'setup', 'mounted', 'created', 'computed', 'methods'].includes(functionName)) {
        warnings.push(`Упомянута несуществующая функция: ${functionName}`);
      }
    }
    
    // Проверяем, упомянуты ли хотя бы некоторые реальные компоненты
    if (realComponents.size > 0 && mentionedComponents.size > 0) {
      const realMentioned = Array.from(mentionedComponents).filter(c => realComponents.has(c));
      if (realMentioned.length === 0 && realComponents.size > 3) {
        errors.push('Ни один из реальных компонентов не упомянут в документации');
      }
    }
    
    // Проверяем наличие выдуманной информации
    const fakePatterns = [
      /MainComponent|ListComponent|DetailComponent/g,
      /компонент.*мучеников/gi,
      /martyrs.*приложение/gi
    ];
    
    fakePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        warnings.push('Обнаружены возможные галлюцинации или выдуманные компоненты');
      }
    });
    
    // Проверяем структуру документации
    const requiredSections = ['обзор', 'overview'];
    const hasRequiredSection = requiredSections.some(section => 
      content.toLowerCase().includes(`## ${section}`) || 
      content.toLowerCase().includes(`# ${section}`)
    );
    
    if (!hasRequiredSection) {
      warnings.push('Отсутствует обязательный раздел "Обзор"');
    }
    
    // Определяем валидность
    const valid = errors.length === 0;
    const coverage = realComponents.size > 0 
      ? (Array.from(mentionedComponents).filter(c => realComponents.has(c)).length / realComponents.size) 
      : 1;
    
    logger.info(`Валидация контента: ${valid ? 'успешно' : 'провалено'}, ` +
                `ошибок: ${errors.length}, предупреждений: ${warnings.length}, ` +
                `покрытие компонентов: ${Math.round(coverage * 100)}%`);
    
    return {
      valid,
      errors,
      warnings,
      stats: {
        realComponents: realComponents.size,
        mentionedComponents: mentionedComponents.size,
        realFunctions: realFunctions.size,
        mentionedFunctions: mentionedFunctions.size,
        coverage
      }
    };
  }
  
  /**
   * Обрабатывает большие промпты с разделением на части
   */
    async processLargePrompt(prompt, context = {}, logger) {
      // Если промпт умещается в лимит, обрабатываем его обычным способом
      const promptTokens = this.estimateTokenCount(prompt);
      if (promptTokens <= this.settings.maxContextTokens / 2) {
        logger.info(`Обработка стандартного промпта (${promptTokens} токенов)`);
        const { optimizedPrompt } = await this.optimizePrompt(prompt, context, logger);
        return await this.sendToChatGPT(optimizedPrompt, logger);
      }
      // Если промпт слишком большой, разделяем его на части
      logger.info(`Обработка большого промпта (${promptTokens} токенов) с разбиением`);
      // Разделяем промпт на части по абзацам
      const paragraphs = prompt.split('\n\n');
      const parts = [];
      let currentPart = [];
      let currentTokens = 0;
      for (const paragraph of paragraphs) {
        const paragraphTokens = this.estimateTokenCount(paragraph);
        if (currentTokens + paragraphTokens <= this.settings.maxContextTokens / 2) {
          currentPart.push(paragraph);
          currentTokens += paragraphTokens;
        } else {
          parts.push(currentPart.join('\n\n'));
          currentPart = [paragraph];
          currentTokens = paragraphTokens;
        }
      }
      if (currentPart.length > 0) {
        parts.push(currentPart.join('\n\n'));
      }
      logger.info(`Промпт разделен на ${parts.length} частей`);
      // Обрабатываем каждую часть
      let combinedResult = '';
      let continuationContext = '';
      for (let i = 0; i < parts.length; i++) {
        logger.info(`Обработка части ${i + 1}/${parts.length}`);
        // Добавляем контекст продолжения для всех частей, кроме первой
        const partPrompt = i === 0 ? parts[i] : `${parts[i]}\n\nПродолжите документацию, используя следующий существующий контекст:\n\n${continuationContext}`;
        // Добавляем инструкции для промежуточных частей
        const finalPrompt =
          i < parts.length - 1
            ? `${partPrompt}\n\nЭто часть ${i + 1} из ${parts.length}, продолжение следует.`
            : `${partPrompt}\n\nЭто последняя часть (${i + 1} из ${parts.length}). Завершите документацию.`;
        // Оптимизируем и отправляем часть
        const { optimizedPrompt } = await this.optimizePrompt(finalPrompt, context, logger);
        const partResult = await this.sendToChatGPT(optimizedPrompt, logger);
        // Добавляем к общему результату
        combinedResult += (i > 0 ? '\n\n' : '') + partResult;
        // Сохраняем последние абзацы как контекст для следующей части
        const resultParagraphs = partResult.split('\n\n');
        continuationContext = resultParagraphs.slice(-3).join('\n\n');
      }
      return combinedResult;
    }
    /**
   * Оптимизирует запрос к ChatGPT для генерации раздела документации
   */
  async optimizeSectionGeneration(section, sectionContent, fileAnalysis, tocStructure, logger) {
    // Подготавливаем структурированную информацию из анализа файлов
    let fileAnalysisPrompt = '';
    let hasFilesWithContent = false;
    
    if (fileAnalysis && fileAnalysis.length > 0) {
      // Проверяем, есть ли файлы с контентом
      hasFilesWithContent = fileAnalysis.some(file => file.content && file.content.trim().length > 0);
      
      if (hasFilesWithContent) {
        fileAnalysisPrompt = `
  ## ИСХОДНЫЙ КОД ФАЙЛОВ ДЛЯ АНАЛИЗА:

  `;
        
        for (const file of fileAnalysis) {
          if (file.content && file.content.trim().length > 0) {
            // Определяем тип языка для подсветки синтаксиса
            const langMap = {
              '.vue': 'vue',
              '.js': 'javascript',
              '.ts': 'typescript',
              '.jsx': 'jsx',
              '.tsx': 'tsx',
              '.scss': 'scss',
              '.css': 'css',
              '.json': 'json'
            };
            const ext = file.path.substring(file.path.lastIndexOf('.'));
            const lang = langMap[ext] || 'javascript';
            
            fileAnalysisPrompt += '\n  ### Файл: ' + file.path + '\n' +
                                  '```' + lang + '\n' +
                                  file.content + '\n' +
                                  '```\n  ';
          }
        }
      } else {
        // Если контента нет, используем анализ
        fileAnalysisPrompt = `
  ## АНАЛИЗ ФАЙЛОВ (исходный код недоступен):

  `;
        
        for (const file of fileAnalysis) {
          fileAnalysisPrompt += '\n  ### Файл: ' + file.path + '\n' +
                                '  - Описание: ' + (file.summary || 'Нет описания') + '\n' +
                                '  - Назначение: ' + (file.purpose || 'Неизвестно') + '\n';
          
          if (file.components && file.components.length > 0) {
            fileAnalysisPrompt += '  - Компоненты:\n';
            file.components.forEach(comp => {
              fileAnalysisPrompt += `    - ${comp.name}: ${comp.responsibility || comp.description || ''}\n`;
            });
          }
          
          if (file.functions && file.functions.length > 0) {
            fileAnalysisPrompt += '  - Функции:\n';
            file.functions.forEach(func => {
              fileAnalysisPrompt += `    - ${func.name}: ${func.description || ''}\n`;
            });
          }
          
          fileAnalysisPrompt += '\n';
        }
      }
    }
    
    // Формируем базовый промпт с акцентом на конкретику
    const basePromptText = hasFilesWithContent 
      ? `Создайте подробный раздел документации "${section.title}" ${section.description ? '(' + section.description + ')' : ''} на основе ИСХОДНОГО КОДА указанных ниже файлов.`
      : `Создайте раздел документации "${section.title}" ${section.description ? '(' + section.description + ')' : ''} на основе анализа файлов.`;
    
    const taskPromptText = hasFilesWithContent
      ? `Проанализируй предоставленный ИСХОДНЫЙ КОД и создай на его основе техническую документацию.`
      : `Создай документацию на основе предоставленного анализа файлов. Обрати внимание, что исходный код недоступен.`;
    
    const prompt = `
  ${basePromptText}

  ${fileAnalysisPrompt}

  ## ЗАДАЧА:

  ${taskPromptText}

  ## ТРЕБОВАНИЯ К ДОКУМЕНТАЦИИ:

  1.  **ОБЯЗАТЕЛЬНО** основывайся **ТОЛЬКО** на предоставленной информации. **НЕ ПРИДУМЫВАЙ** компоненты, функции или детали.
  ${hasFilesWithContent ? `2.  Для Vue компонентов, детально опиши:
      *   **Props**: Извлеки из defineProps() - имя, тип, 'default', 'required'. Приведи пример использования.
      *   **Emits**: Извлеки из defineEmits() - имя события и параметры.
      *   **Slots**: Извлеки из defineSlots() или из template - имя слота и назначение.` : 
  `2.  Опиши компоненты и функции на основе предоставленного анализа.`}
  3.  ${hasFilesWithContent ? 'Создай раздел **Примеры использования** с работающим кодом из исходников.' : 'Если возможно, приведи примеры использования на основе анализа.'}
  4.  Структура раздела должна быть следующей:
      *   **Обзор**: Краткое описание назначения модуля/компонентов.
      ${hasFilesWithContent ? '*   **API компонента**: Подробное описание props, emits и slots (если есть).' : '*   **Архитектура**: Описание компонентов и их взаимодействия.'}
      *   **Примеры использования**: ${hasFilesWithContent ? 'Код из исходников.' : 'Если доступны из анализа.'}
      *   **Зависимости**: Список импортируемых модулей.

  ${hasFilesWithContent ? 'Используй ТОЛЬКО те компоненты, функции и детали, которые ЯВНО присутствуют в исходном коде.' : 'Используй ТОЛЬКО информацию из предоставленного анализа.'}
  
  Если информации недостаточно для какого-то подраздела, напиши "Информация недоступна" или пропусти подраздел.

  Стиль документации должен быть техническим и точным.
  `;

    // Оптимизируем контекст для запроса
    const context = {
      sectionId: section.id,
      sectionType: section.id.startsWith('framework-') ? 'framework' : 'project',
      sectionTitle: section.title,
      tocStructure,
      // Не передаем fileAnalysis в контекст, так как уже включили в промпт
    };

    // Обрабатываем с учетом возможного большого размера
    if (sectionContent) {
      // Если у нас уже есть контент для раздела, проверяем его качество
      const updatePrompt = `
  ${prompt}

  ## Существующий контент для улучшения:

  ${sectionContent}

  ## Задача:
  1. Проверьте, соответствует ли существующий контент реальному анализу файлов
  2. Исправьте неточности и общие фразы
  3. Добавьте конкретные детали из анализа файлов
  4. Удалите информацию, не подтвержденную анализом
  `;
      return await this.processLargePrompt(updatePrompt, context, logger);
    } else {
      // Если контента нет, генерируем с нуля
      return await this.processLargePrompt(prompt, context, logger);
    }
  }
  /**
   * Валидирует сгенерированный контент на соответствие анализу файлов
   */
  async validateGeneratedContent(content, fileAnalysis, logger) {
    if (!fileAnalysis || fileAnalysis.length === 0) {
      return { valid: true, warnings: [] };
    }
    
    const warnings = [];
    const errors = [];
    
    // Собираем ключевые термины из анализа
    const expectedTerms = new Set();
    const componentNames = new Set();
    const functionNames = new Set();
    
    for (const file of fileAnalysis) {
      // Добавляем имена файлов
      expectedTerms.add(file.name.toLowerCase());
      
      // Добавляем имена компонентов
      if (file.components) {
        for (const component of file.components) {
          if (component.name) {
            componentNames.add(component.name);
            expectedTerms.add(component.name.toLowerCase());
          }
        }
      }
      
      // Добавляем имена функций
      if (file.functions) {
        for (const func of file.functions) {
          if (func.name) {
            functionNames.add(func.name);
            expectedTerms.add(func.name.toLowerCase());
          }
        }
      }
      
      // Добавляем ключевые слова из purpose и summary
      const keyWords = (file.purpose + ' ' + file.summary)
        .toLowerCase()
        .match(/\b[a-z]{4,}\b/g) || [];
      
      keyWords.forEach(word => {
        if (!['этот', 'файл', 'для', 'которая', 'настраивает'].includes(word)) {
          expectedTerms.add(word);
        }
      });
    }
    
    const contentLower = content.toLowerCase();
    
    // Проверка 1: Упоминаются ли основные компоненты
    let mentionedComponents = 0;
    for (const component of componentNames) {
      if (content.includes(component)) {
        mentionedComponents++;
      }
    }
    
    if (componentNames.size > 0 && mentionedComponents < componentNames.size * 0.5) {
      warnings.push(`Упомянуто только ${mentionedComponents} из ${componentNames.size} компонентов`);
    }
    
    // Проверка 2: Упоминаются ли основные функции
    let mentionedFunctions = 0;
    for (const func of functionNames) {
      if (content.includes(func)) {
        mentionedFunctions++;
      }
    }
    
    if (functionNames.size > 0 && mentionedFunctions < functionNames.size * 0.3) {
      warnings.push(`Упомянуто только ${mentionedFunctions} из ${functionNames.size} функций`);
    }
    
    // Проверка 3: Есть ли общие фразы, не относящиеся к анализу
    const genericPhrases = [
      'улучшает seo',
      'поисковые системы',
      'react-компоненты',
      'индексация поисковыми',
      'первая отрисовка'
    ];
    
    const foundGenericPhrases = [];
    for (const phrase of genericPhrases) {
      if (contentLower.includes(phrase) && !Array.from(expectedTerms).some(term => term.includes(phrase))) {
        foundGenericPhrases.push(phrase);
      }
    }
    
    if (foundGenericPhrases.length > 0) {
      warnings.push(`Найдены общие фразы, не подтвержденные анализом: ${foundGenericPhrases.join(', ')}`);
    }
    
    // Проверка 4: Соответствие описаний
    const hasAccurateDescriptions = expectedTerms.size > 0 && 
      Array.from(expectedTerms).filter(term => contentLower.includes(term)).length > expectedTerms.size * 0.3;
    
    if (!hasAccurateDescriptions) {
      errors.push('Контент не соответствует анализу файлов');
    }
    
    const valid = errors.length === 0;
    
    if (!valid || warnings.length > 0) {
      logger.warn(`Валидация контента: ${errors.length} ошибок, ${warnings.length} предупреждений`);
      errors.forEach(err => logger.error(`Ошибка валидации: ${err}`));
      warnings.forEach(warn => logger.warn(`Предупреждение валидации: ${warn}`));
    }
    
    return {
      valid,
      errors,
      warnings,
      stats: {
        expectedTerms: expectedTerms.size,
        mentionedComponents,
        totalComponents: componentNames.size,
        mentionedFunctions,
        totalFunctions: functionNames.size
      }
    };
  }

  /**
   * Генерирует документацию для батча файлов с учетом контекста
   */
  async generateDocumentationForBatch(files, prompt, logger) {
    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
      organization: config.openaiOrkKey,
    });
    
    // Подготавливаем контент файлов для промпта (сокращенный формат)
    const filesContent = files.map(file => {
      const analysis = file.analysis || {};
      
      return `
=== ${file.name} ===
Назначение: ${analysis.Purpose || analysis.Summary || 'Не указано'}
Компоненты: ${analysis.Components?.map(c => c.name).join(', ') || 'Нет'}
Функции: ${analysis.Functions?.map(f => f.name).join(', ') || 'Нет'}
Зависимости: ${analysis.Dependencies?.slice(0, 5).join(', ') || 'Нет'}${analysis.Dependencies?.length > 5 ? '...' : ''}
`;
    }).join('\n');

    const fullPrompt = `${prompt}\n\nФАЙЛЫ:\n${filesContent}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Создай краткую техническую документацию на основе предоставленного анализа файлов. Используй только факты из анализа.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0
      });

      const documentation = response.choices[0]?.message?.content || '';
      
      if (!documentation.trim()) {
        throw new Error('Получен пустой ответ от OpenAI');
      }

      logger.info(`Сгенерирована документация для батча из ${files.length} файлов`);
      return documentation;

    } catch (error) {
      logger.error(`Ошибка при генерации документации для батча: ${error.message}`);
      throw error;
    }
  }
}
export default ContextOptimizer;
