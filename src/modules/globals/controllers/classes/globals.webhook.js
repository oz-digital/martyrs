class Webhook {
  constructor(app, db, observer, path, handlerMethod, middlewares = []) {
    this.app = app;
    this.db = db;
    this.observer = observer;
    // Ensure that the handlerMethod is bound and middlewares are correctly spread.
    this.app.post(path, [...middlewares, handlerMethod.bind(this)]);
  }
  // Abstract method, must be implemented in derived classes
  handleWebhook(req, res) {
    throw new Error('handleWebhook() must be implemented by subclasses');
  }
}
export default Webhook;
