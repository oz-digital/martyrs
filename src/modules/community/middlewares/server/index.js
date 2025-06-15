// Импортируем модуль verifyBlogpost
import verifyBlogpostModule from './verifyBlogpost.js';

const middlewareIndexFactory = db => {
  const verifyBlogpost = verifyBlogpostModule(db);
  
  return {
    verifyBlogpost,
  };
};

export default middlewareIndexFactory;