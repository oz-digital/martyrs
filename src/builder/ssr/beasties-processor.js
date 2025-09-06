import Beasties from 'beasties';
import path from 'path';

export function createBeastiesProcessor(projectRoot, options = {}) {
  // Путь к директории с CSS файлами
  const cssPath = path.join(projectRoot, 'builds/web/client');
  
  console.log('[Beasties] Initializing with CSS path:', cssPath);
  
  const beasties = new Beasties({
    // ВАЖНО: указываем путь к директории с CSS файлами
    path: cssPath,
    
    // Публичный путь для резолва URL в link тегах
    publicPath: '/',
    
    // Обрабатывать внешние CSS файлы
    external: true,
    
    // Встроить ВСЕ используемые стили без ограничений
    inlineThreshold: 0,
    
    // Lazy-load остальные стили через swap
    preload: 'swap',
    
    // НЕ УДАЛЯТЬ встроенные правила из внешних файлов (иначе ломается для последующих запросов)
    pruneSource: false,
    
    // Добавить noscript fallback для браузеров без JS
    noscriptFallback: true,
    
    // Минифицировать встроенные стили
    compress: true,
    
    // Встраивать критические keyframes
    keyframes: 'critical',
    
    // Встраивать используемые шрифты
    fonts: true,
    
    // Уровень логирования для отладки
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    
    // Дополнительные опции пользователя
    ...options
  });

  return {
    async processHtml(html, { url } = {}) {
      try {
        console.log('[Beasties] Processing HTML for URL:', url);
        
        // Логируем наличие CSS link тегов
        const cssLinks = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g);
        console.log('[Beasties] Found CSS links:', cssLinks?.length || 0);
        
        // Обрабатываем HTML через Beasties
        const processedHtml = await beasties.process(html);
        
        // Проверяем, что critical CSS был добавлен
        const hasInlineStyles = processedHtml.includes('<style>');
        const hasSwapLinks = processedHtml.includes('onload="this.media=\'all\'');
        console.log('[Beasties] Critical CSS inlined:', hasInlineStyles);
        console.log('[Beasties] CSS lazy-loading enabled:', hasSwapLinks);
        
        // Логируем размер встроенного CSS
        const inlineStyleMatch = processedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        if (inlineStyleMatch) {
          const inlineSize = inlineStyleMatch[1].length;
          console.log('[Beasties] Inline CSS size:', Math.round(inlineSize / 1024), 'KB');
        }
        
        // Дополнительная оптимизация: удаляем дублирующиеся стили
        const optimizedHtml = removeDuplicateStyles(processedHtml);
        
        return optimizedHtml;
      } catch (error) {
        console.error('[Beasties] Processing error:', error);
        console.error('[Beasties] Error stack:', error.stack);
        // В случае ошибки возвращаем оригинальный HTML
        return html;
      }
    },
    
  };
}

// Утилита для удаления дублирующихся стилей
function removeDuplicateStyles(html) {
  // Находим все inline стили
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles = new Set();
  
  return html.replace(styleRegex, (match, content) => {
    const trimmedContent = content.trim();
    
    // Если стиль уже встречался, удаляем дубликат
    if (styles.has(trimmedContent)) {
      return '';
    }
    
    styles.add(trimmedContent);
    return match;
  });
}

// Дефолтный экспорт удален - теперь требуется projectRoot