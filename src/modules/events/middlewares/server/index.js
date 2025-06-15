import verifyEventModule from './verifyEvent.js';

const middlewareIndexFactory = db => {
  const verifyEvent = verifyEventModule(db);
  
  return {
    verifyEvent,
  };
};

export default middlewareIndexFactory;