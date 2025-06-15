import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import globalsQuery from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
class CRUD {
  constructor(basePath, app, db, model, options) {
    this.model = model;
    this.cache = new Cache();
    this.logger = new Logger(db);
    this.app = app;
    this.basePath = basePath;
    if (!options || (options && !options.disableDefaultRoutes)) this.registerRoutes();
  }
  registerRoutes() {
    this.app.post(`${this.basePath}/create`, this.create.bind(this));
    this.app.get(`${this.basePath}/read`, this.read.bind(this));
    this.app.put(`${this.basePath}/update`, this.update.bind(this));
    this.app.delete(`${this.basePath}/delete`, this.delete.bind(this));
  }
  async create(req, res) {
    try {
      const createdData = await this.model.create(req.body);
      await this.cache.flush();
      res.status(201).json(createdData);
    } catch (error) {
      console.log(error);
      this.logger.error('Ошибка создания данных', error);
      res.status(500).json({ error: error.message });
    }
  }
  async read(req, res) {
    try {
      let stages = [];
      stages = [
        ...globalsQuery.getBasicOptions(req.query),
        // For creator
        globalsQuery.getCreatorUserLookupStage(),
        globalsQuery.getCreatorOrganizationLookupStage(),
        // For owner
        globalsQuery.getOwnerUserLookupStage(),
        globalsQuery.getOwnerOrganizationLookupStage(),
        globalsQuery.getAddFieldsCreatorOwnerStage(),
        // Pagination
        ...globalsQuery.getSortingOptions(req.query.sortParam, req.query.sortOrder),
        ...globalsQuery.getPaginationOptions(req.query.skip, req.query.limit),
        globalsQuery.removeTempPropeties(),
      ];
      const cacheKey = JSON.stringify({ stages });
      let data = await this.cache.get(cacheKey);
      if (!data) {
        data = await this.model.aggregate(stages).exec();
        await this.cache.set(cacheKey, data);
      }
      res.json(data);
    } catch (error) {
      this.logger.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const updatedData = await this.model.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedData) {
        throw new Error('Документ не найден.');
      }
      await this.cache.flush();
      res.json(updatedData);
    } catch (error) {
      this.logger.error('Ошибка обновления данных', error);
      res.status(404).json({ error: error.message });
    }
  }
  async delete(req, res) {
    try {
      const deletedData = await this.model.findOneAndDelete({ _id: req.body._id });
      if (!deletedData) {
        throw new Error('Документ не найден.');
      }
      await this.cache.flush();
      res.status(204).send();
    } catch (error) {
      this.logger.error('Ошибка удаления данных', error);
      res.status(404).json({ error: error.message });
    }
  }
}
export default CRUD;
