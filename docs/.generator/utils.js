import { promises } from 'fs';
import path from 'path';
// doc-generator/utils.js
const fs = { promises }.promises;
import { glob } from 'glob';
/**
 * Простая токенизация текста для оценки количества токенов
 * Примечание: это грубая оценка, не точная реализация токенизатора OpenAI
 */
function tokenize(text) {
  if (!text) return [];
  // Токенизация по пробелам и специальным символам
  return text
    .replace(/[\r\n]+/g, '\n')
    .replace(/([.,!?;:])/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
}
/**
 * Рекурсивно находит файлы по паттерну
 */
async function findFiles(patterns, options = {}) {
  const matches = await glob(patterns, {
    ignore: options.ignore || ['**/node_modules/**', '**/.git/**'],
    absolute: true,
    ...options,
  });
  return matches;
}
/**
 * Сканирует директорию на наличие файлов документации
 */
async function scanDocumentationFiles(directory, extensions = ['.md']) {
  const results = [];
  try {
    // Проверяем существование директории
    const stats = await fs.stat(directory);
    if (!stats.isDirectory()) {
      return results;
    }
    // Получаем список файлов
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        // Рекурсивно сканируем поддиректории
        const subResults = await scanDocumentationFiles(fullPath, extensions);
        results.push(...subResults);
      } else if (entry.isFile()) {
        // Проверяем расширение файла
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          results.push({
            path: fullPath,
            name: entry.name,
            extension: ext,
            relativePath: path.relative(directory, fullPath),
          });
        }
      }
    }
  } catch (err) {
    console.error(`Ошибка при сканировании директории ${directory}:`, err.message);
  }
  return results;
}
/**
 * Разделяет большой текст на части с учетом смысловых границ
 */
function splitTextIntoChunks(text, maxChunkSize = 1500) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      // Если текущий параграф не помещается, сохраняем накопленный чанк
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Если параграф слишком большой для одного чанка, разделяем его по предложениям
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length + 1 <= maxChunkSize) {
            sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
          } else {
            chunks.push(sentenceChunk);
            sentenceChunk = sentence;
          }
        }
        if (sentenceChunk) {
          currentChunk = sentenceChunk;
        }
      }
    }
  }
  // Добавляем последний чанк, если он не пустой
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}
/**
 * Извлекает часть документа между заголовками
 */
function extractSectionByHeading(content, headingText, headingLevel = 2) {
  const headingMarker = '#'.repeat(headingLevel);
  const headingRegex = new RegExp(`^${headingMarker}\\s+${headingText}`, 'm');
  const match = content.match(headingRegex);
  if (!match) {
    return null;
  }
  const startIndex = match.index;
  let endIndex = content.length;
  // Ищем следующий заголовок того же или более высокого уровня
  const nextHeadingRegex = new RegExp(`^#{1,${headingLevel}}\\s+`, 'm');
  const restContent = content.substring(startIndex + match[0].length);
  const nextMatch = restContent.match(nextHeadingRegex);
  if (nextMatch) {
    endIndex = startIndex + match[0].length + nextMatch.index;
  }
  return content.substring(startIndex, endIndex).trim();
}
/**
 * Обнаруживает язык программирования в блоке кода
 */
function detectCodeLanguage(codeBlock) {
  // Простые эвристики для определения языка
  if (codeBlock.includes('function') && codeBlock.includes('{') && codeBlock.includes('}')) {
    if (codeBlock.includes('import React') || codeBlock.includes('<div>') || codeBlock.includes('export default')) {
      return 'jsx';
    }
    return codeBlock.includes('import ') || codeBlock.includes('export ') ? 'javascript' : 'js';
  }
  if (codeBlock.includes('<template>') && codeBlock.includes('<script>')) {
    return 'vue';
  }
  if (codeBlock.includes('class') && codeBlock.includes('extends') && codeBlock.includes('{')) {
    return 'javascript';
  }
  if (codeBlock.includes('$') && codeBlock.includes(':') && (codeBlock.includes('@include') || codeBlock.includes('@mixin'))) {
    return 'scss';
  }
  if (codeBlock.includes('{') && codeBlock.includes('}') && codeBlock.includes(':')) {
    return codeBlock.includes('@media') || codeBlock.includes('@keyframes') ? 'css' : 'json';
  }
  return '';
}
/**
 * Извлекает блоки кода из markdown-документа
 */
function extractCodeBlocks(markdown) {
  const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)\n```/g;
  const codeBlocks = [];
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    let language = match[1].trim();
    const code = match[2];
    // Если язык не указан, пытаемся определить его
    if (!language) {
      language = detectCodeLanguage(code);
    }
    codeBlocks.push({
      language,
      code,
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return codeBlocks;
}
/**
 * Извлекает заголовки из markdown-документа
 */
function extractHeadings(markdown) {
  const headingRegex = /^(#{1,6})\s+(.+?)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({
      level,
      text,
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return headings;
}
export { detectCodeLanguage, extractCodeBlocks, extractHeadings, extractSectionByHeading, findFiles, scanDocumentationFiles, splitTextIntoChunks, tokenize };
export default {
  tokenize,
  findFiles,
  scanDocumentationFiles,
  splitTextIntoChunks,
  extractSectionByHeading,
  detectCodeLanguage,
  extractCodeBlocks,
  extractHeadings,
};
