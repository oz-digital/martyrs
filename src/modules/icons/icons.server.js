import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconsRoutes from './routes/icons.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.THENOUNPROJECT_KEY;
const API_SECRET = process.env.THENOUNPROJECT_SECRET;
const BASE_URL = 'https://api.thenounproject.com/v2';

// OAuth 1.0a signature generation
function generateOAuthSignature(method, url, oauthParams, queryParams, consumerSecret) {
  // Combine OAuth params and query params
  const allParams = { ...oauthParams, ...queryParams };
  
  // Sort and encode parameters
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&`;
  
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

// Generate OAuth headers
function generateOAuthHeader(method, url, queryParams = {}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Generate nonce with minimum 8 characters as per documentation
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const oauthParams = {
    oauth_consumer_key: API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0'
  };

  const signature = generateOAuthSignature(method, url, oauthParams, queryParams, API_SECRET);
  oauthParams.oauth_signature = signature;

  // Build OAuth header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return authHeader;
}

// Search icons by term with pagination support
export async function searchIcons(term, options = {}) {
  try {
    const { 
      limit = 20, 
      next_page, 
      prev_page 
    } = typeof options === 'number' ? { limit: options } : options;

    const url = `${BASE_URL}/icon`;
    const queryParams = { 
      query: term, 
      limit_to_public_domain: '1', 
      limit: limit.toString(),
      thumbnail_size: '84'
    };

    // Add pagination tokens if provided
    if (next_page) {
      queryParams.next_page = next_page;
    }
    if (prev_page) {
      queryParams.prev_page = prev_page;
    }
    
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = `${url}?${queryString}`;
    
    const authHeader = generateOAuthHeader('GET', url, queryParams);
    
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return complete response with pagination info
    return {
      icons: data.icons || [],
      next_page: data.next_page || null,
      prev_page: data.prev_page || null,
      total: data.total || (data.icons ? data.icons.length : 0)
    };
  } catch (error) {
    console.error('Error searching icons:', error);
    throw error;
  }
}

// Get icon details by ID
export async function getIconById(iconId) {
  try {
    const url = `${BASE_URL}/icon/${iconId}`;
    const queryParams = { thumbnail_size: '200' };
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = `${url}?${queryString}`;
    
    const authHeader = generateOAuthHeader('GET', url, queryParams);
    
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.icon;
  } catch (error) {
    console.error('Error getting icon:', error);
    throw error;
  }
}

// Download SVG content
export async function downloadIconSvg(svgUrl) {
  try {
    // The Noun Project SVG URLs are signed and temporary
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`Failed to download SVG: ${response.status}`);
    }
    const svgContent = await response.text();
    
    // Sometimes the API returns base64 encoded SVG
    if (svgContent.startsWith('data:image/svg+xml;base64,')) {
      const base64Data = svgContent.split(',')[1];
      return Buffer.from(base64Data, 'base64').toString('utf-8');
    }
    
    return svgContent;
  } catch (error) {
    console.error('Error downloading SVG:', error);
    throw error;
  }
}

// Convert SVG to Vue component format
export function convertSvgToVueComponent(svgContent, iconName) {
  // Remove XML declaration and DOCTYPE if present
  let cleanSvg = svgContent.replace(/<\?xml[^>]*\?>/g, '');
  cleanSvg = cleanSvg.replace(/<!DOCTYPE[^>]*>/g, '');
  cleanSvg = cleanSvg.trim();

  // Replace fill attributes with :fill prop binding
  cleanSvg = cleanSvg.replace(/fill="[^"]*"/g, ':fill="fill"');
  cleanSvg = cleanSvg.replace(/stroke="[^"]*"/g, ':stroke="fill"');

  // Add fill to SVG elements that don't have fill or stroke attributes
  const svgElements = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'g'];
  svgElements.forEach(element => {
    // Match opening tags without fill or stroke attributes
    const regex = new RegExp(`<${element}(\\s+[^>]*?)?(?<!:fill="fill"|:stroke="fill")(/?)>`, 'gi');
    cleanSvg = cleanSvg.replace(regex, (match, attributes, selfClosing) => {
      // Check if this element already has fill or stroke
      if (match.includes('fill') || match.includes('stroke')) {
        return match;
      }
      // Add :fill="fill" right after the element name
      return `<${element} :fill="fill"${attributes || ''}${selfClosing || ''}>`;
    });
  });

  // Ensure proper formatting with indentation
  cleanSvg = cleanSvg.replace(/<svg/g, '\n<svg');
  cleanSvg = cleanSvg.replace(/<\/svg>/g, '\n</svg>');
  cleanSvg = cleanSvg.replace(/<(path|rect|circle|ellipse|polygon|polyline|line|g)/g, '\n\t<$1');
  cleanSvg = cleanSvg.replace(/>\s*\n\s*</g, '>\n<');

  const vueComponent = `<template>${cleanSvg}
</template>

<script setup>
\tconst props = defineProps({
\t  fill: {
\t    type: String,
\t    default: 'rgb(var(--black))'
\t  }
\t})
</script>`;

  return vueComponent;
}

// Save icon to disk
export async function saveIconToDisk(iconId, category, iconName, mode = 'add', currentIconName = null) {
  try {
    // Get icon details with SVG URL
    const icon = await getIconById(iconId);
    
    if (!icon.icon_url) {
      throw new Error('No SVG URL available for this icon');
    }
    
    // Download SVG
    const svgContent = await downloadIconSvg(icon.icon_url);
    
    // Convert to Vue component
    const vueComponent = convertSvgToVueComponent(svgContent, iconName);
    
    // Determine file path
    const categoryPath = path.join(__dirname, category);
    const filePath = path.join(categoryPath, `${iconName}.vue`);
    
    // Ensure directory exists
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }
    
    // If replacing, delete old file if name is different
    if (mode === 'replace' && currentIconName && currentIconName !== iconName) {
      const oldFilePath = path.join(categoryPath, `${currentIconName}.vue`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Save file
    fs.writeFileSync(filePath, vueComponent);
    
    return {
      success: true,
      filePath: filePath.replace(__dirname, ''),
      content: vueComponent,
      iconData: {
        name: iconName,
        category,
        originalName: icon.term,
        attribution: icon.attribution
      }
    };
  } catch (error) {
    console.error('Error saving icon:', error);
    throw error;
  }
}

// Module initialization
function initializeIcons(app, db, origins, publicPath, options = {}) {
  console.log('initializeIcons publicPath:', publicPath);
  
  // Setup routes if app object is provided
  if (app) {
    iconsRoutes(app, db, origins, publicPath);
  }
}

export const routes = {
  iconsRoutes
};

export { initializeIcons as initialize };

export default {
  initialize: initializeIcons,
  routes
};