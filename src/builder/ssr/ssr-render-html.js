import Mustache from 'mustache';
import template from '../templates/page.js';

const renderHtml = async stuff => {
  const data = {
    ...stuff,
    googleTagId: process.env.GOOGLE_TAG_ID,
    facebookPixelId: process.env.FACEBOOK_PIXEL_ID,
    facebookDomainVerification: process.env.FACEBOOK_DOMAIN_VERIFICATION,
    googleMapApiKey: process.env.GOOGLE_MAPS_API_KEY,
  };
  return Mustache.render(template, data);
};

const createHtmlRenderer = onTemplateUpdate => {
  setInterval(() => {
    // Для ES модулей нам не нужно вручную удалять кэш
    // При изменении файла импорт сам обновится при следующем импорте
    if (onTemplateUpdate) {
      onTemplateUpdate();
    }
  }, 1000);
  
  return async stuff => {
    const data = {
      ...stuff,
      googleTagId: process.env.GOOGLE_TAG_ID,
      facebookPixelId: process.env.FACEBOOK_PIXEL_ID,
      facebookDomainVerification: process.env.FACEBOOK_DOMAIN_VERIFICATION,
      googleMapApiKey: process.env.GOOGLE_MAPS_API_KEY,
    };
    return Mustache.render(template, data);
  };
};

export { createHtmlRenderer, renderHtml };
export default {
  createHtmlRenderer,
  renderHtml,
};