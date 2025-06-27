import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { parse as parseVue } from '@vue/compiler-sfc';
import { Project } from 'ts-morph';

/**
 * Разделитель файлов по AST для умного батчинга
 */
class ASTSplitter {
  constructor() {
    this.tsProject = new Project({
      compilerOptions: {
        allowJs: true,
        jsx: 'preserve'
      }
    });
  }

  /**
   * Разбивает файл на логические части на основе AST
   */
  async splitFile(file, maxTokensPerChunk = 4000) {
    const ext = file.name.split('.').pop();
    
    switch (ext) {
      case 'vue':
        return this.splitVueFile(file, maxTokensPerChunk);
      case 'ts':
      case 'tsx':
        return this.splitTypeScriptFile(file, maxTokensPerChunk);
      case 'js':
      case 'jsx':
        return this.splitJavaScriptFile(file, maxTokensPerChunk);
      default:
        // Для других файлов возвращаем как есть
        return [{
          ...file,
          chunk: 0,
          content: file.content,
          estimatedTokens: this.estimateTokens(file.content)
        }];
    }
  }

  /**
   * Разбивает Vue файл на компоненты
   */
  splitVueFile(file, maxTokensPerChunk) {
    try {
      const { descriptor } = parseVue(file.content);
      const chunks = [];

      // Обрабатываем template
      if (descriptor.template) {
        chunks.push({
          ...file,
          chunk: chunks.length,
          type: 'template',
          content: `<template>${descriptor.template.content}</template>`,
          estimatedTokens: this.estimateTokens(descriptor.template.content)
        });
      }

      // Обрабатываем script/script setup
      const scriptBlock = descriptor.script || descriptor.scriptSetup;
      if (scriptBlock) {
        const scriptChunks = this.splitJavaScriptContent(
          scriptBlock.content,
          maxTokensPerChunk,
          file
        );
        
        scriptChunks.forEach((chunk, idx) => {
          chunks.push({
            ...chunk,
            chunk: chunks.length,
            type: scriptBlock.setup ? 'script-setup' : 'script'
          });
        });
      }

      // Обрабатываем styles
      if (descriptor.styles && descriptor.styles.length > 0) {
        const styleContent = descriptor.styles
          .map(style => `<style${style.scoped ? ' scoped' : ''}>${style.content}</style>`)
          .join('\n');
        
        chunks.push({
          ...file,
          chunk: chunks.length,
          type: 'styles',
          content: styleContent,
          estimatedTokens: this.estimateTokens(styleContent)
        });
      }

      return chunks.length > 0 ? chunks : [{
        ...file,
        chunk: 0,
        content: file.content,
        estimatedTokens: this.estimateTokens(file.content)
      }];
    } catch (error) {
      console.error(`Error parsing Vue file ${file.name}:`, error);
      return [{
        ...file,
        chunk: 0,
        content: file.content,
        estimatedTokens: this.estimateTokens(file.content)
      }];
    }
  }

  /**
   * Разбивает TypeScript файл
   */
  splitTypeScriptFile(file, maxTokensPerChunk) {
    try {
      const sourceFile = this.tsProject.createSourceFile(
        file.path,
        file.content,
        { overwrite: true }
      );

      const chunks = [];
      const exports = [];
      const imports = sourceFile.getImportDeclarations()
        .map(imp => imp.getText())
        .join('\n');

      // Собираем все экспортируемые сущности
      sourceFile.forEachChild(node => {
        if (node.isKind(node.getKind())) {
          const nodeText = node.getText();
          const tokens = this.estimateTokens(nodeText);
          
          if (tokens > maxTokensPerChunk) {
            // Если узел слишком большой, пытаемся разбить его
            const subChunks = this.splitLargeNode(node, maxTokensPerChunk);
            exports.push(...subChunks);
          } else {
            exports.push({
              text: nodeText,
              tokens: tokens,
              kind: node.getKindName()
            });
          }
        }
      });

      // Группируем экспорты в чанки
      let currentChunk = imports ? [imports] : [];
      let currentTokens = imports ? this.estimateTokens(imports) : 0;

      for (const exp of exports) {
        if (currentTokens + exp.tokens > maxTokensPerChunk && currentChunk.length > 0) {
          chunks.push({
            ...file,
            chunk: chunks.length,
            content: currentChunk.join('\n\n'),
            estimatedTokens: currentTokens
          });
          currentChunk = [imports, exp.text];
          currentTokens = this.estimateTokens(imports) + exp.tokens;
        } else {
          currentChunk.push(exp.text);
          currentTokens += exp.tokens;
        }
      }

      // Добавляем последний чанк
      if (currentChunk.length > 0) {
        chunks.push({
          ...file,
          chunk: chunks.length,
          content: currentChunk.join('\n\n'),
          estimatedTokens: currentTokens
        });
      }

      return chunks.length > 0 ? chunks : [{
        ...file,
        chunk: 0,
        content: file.content,
        estimatedTokens: this.estimateTokens(file.content)
      }];
    } catch (error) {
      console.error(`Error parsing TypeScript file ${file.name}:`, error);
      return this.splitJavaScriptFile(file, maxTokensPerChunk);
    }
  }

  /**
   * Разбивает JavaScript файл
   */
  splitJavaScriptFile(file, maxTokensPerChunk) {
    return this.splitJavaScriptContent(file.content, maxTokensPerChunk, file);
  }

  /**
   * Разбивает JavaScript контент
   */
  splitJavaScriptContent(content, maxTokensPerChunk, file) {
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      });

      const chunks = [];
      const nodes = [];

      // Собираем все верхнеуровневые узлы
      traverse.default(ast, {
        enter(path) {
          if (path.isProgram()) return;
          
          // Собираем только верхнеуровневые декларации
          if (path.parent.type === 'Program') {
            const start = path.node.start;
            const end = path.node.end;
            const nodeContent = content.slice(start, end);
            const tokens = this.estimateTokens(nodeContent);

            nodes.push({
              type: path.node.type,
              content: nodeContent,
              tokens: tokens,
              start: start,
              end: end
            });
            
            path.skip();
          }
        }
      });

      // Группируем узлы в чанки
      let currentChunk = [];
      let currentTokens = 0;

      for (const node of nodes) {
        if (currentTokens + node.tokens > maxTokensPerChunk && currentChunk.length > 0) {
          chunks.push({
            ...file,
            chunk: chunks.length,
            content: currentChunk.map(n => n.content).join('\n\n'),
            estimatedTokens: currentTokens
          });
          currentChunk = [node];
          currentTokens = node.tokens;
        } else {
          currentChunk.push(node);
          currentTokens += node.tokens;
        }
      }

      // Добавляем последний чанк
      if (currentChunk.length > 0) {
        chunks.push({
          ...file,
          chunk: chunks.length,
          content: currentChunk.map(n => n.content).join('\n\n'),
          estimatedTokens: currentTokens
        });
      }

      return chunks.length > 0 ? chunks : [{
        ...file,
        chunk: 0,
        content: content,
        estimatedTokens: this.estimateTokens(content)
      }];
    } catch (error) {
      console.error(`Error parsing JavaScript content:`, error);
      // Fallback: простое разбиение по строкам
      return this.fallbackSplit(content, maxTokensPerChunk, file);
    }
  }

  /**
   * Пытается разбить большой узел AST
   */
  splitLargeNode(node, maxTokensPerChunk) {
    // Для классов и больших функций можно попробовать разбить по методам
    // Пока возвращаем как есть
    return [{
      text: node.getText(),
      tokens: this.estimateTokens(node.getText())
    }];
  }

  /**
   * Запасной метод разбиения по строкам
   */
  fallbackSplit(content, maxTokensPerChunk, file) {
    const lines = content.split('\n');
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;

    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      
      if (currentTokens + lineTokens > maxTokensPerChunk && currentChunk.length > 0) {
        chunks.push({
          ...file,
          chunk: chunks.length,
          content: currentChunk.join('\n'),
          estimatedTokens: currentTokens
        });
        currentChunk = [line];
        currentTokens = lineTokens;
      } else {
        currentChunk.push(line);
        currentTokens += lineTokens;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push({
        ...file,
        chunk: chunks.length,
        content: currentChunk.join('\n'),
        estimatedTokens: currentTokens
      });
    }

    return chunks;
  }

  /**
   * Оценивает количество токенов в тексте
   */
  estimateTokens(text) {
    // Более точная оценка с учетом особенностей кода
    // Считаем слова, операторы, скобки и т.д.
    const words = text.match(/\b\w+\b/g) || [];
    const operators = text.match(/[+\-*/%=<>!&|^~?:]/g) || [];
    const brackets = text.match(/[(){}[\]]/g) || [];
    const punctuation = text.match(/[,;.]/g) || [];
    
    return words.length + operators.length + brackets.length + punctuation.length;
  }
}

export default ASTSplitter;