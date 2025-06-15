// Импортируем модуль middlewareBusboy
import middlewareBusboyModule from './middlewareBusboy.js';

const middlewareIndexFactory = (db, publicPath) => {
  const middlewareBusboy = middlewareBusboyModule(db, publicPath);
  
  return {
    middlewareBusboy,
  };
};

export default middlewareIndexFactory;