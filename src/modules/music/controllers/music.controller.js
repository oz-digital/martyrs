import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import CRUD from '@martyrs/src/modules/globals/controllers/classes/globals.crud.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
const { getInstance } = globalsabac;
export default (function (app, db) {
  const logger = new Logger(db);
  const cache = new Cache();
  const abac = getInstance(db);
  class MusicController extends CRUD {
    constructor(basePath, app, db, model, options) {
      super(basePath, app, db, model, options);
      this.logger = logger;
      this.cache = cache;
      this.abac = abac;
      // Log initialization to help debugging
      // console.log(`[MusicController] Initialized with basePath: ${basePath}`);
      // console.log(`[MusicController] Model: ${model?.modelName || 'No model provided'}`);
    }
    // Override the create method to handle ownership
    async create(req, res) {
      try {
        console.log(`[MusicController] Create request received:`, {
          userId: req.userId,
          body: req.body,
        });
        // Ensure userId exists
        if (!req.userId) {
          console.error('[MusicController] No userId found in request, auth middleware may have failed');
          return res.status(401).json({
            errorCode: 'AUTHENTICATION_REQUIRED',
            message: 'You must be authenticated to perform this action',
          });
        }
        // Set creator and owner if not provided
        if (!req.body.creator) {
          req.body.creator = {
            type: 'user', // Note lowercase - must match your schema expectations
            target: req.userId,
          };
        }
        if (!req.body.owner) {
          req.body.owner = {
            type: 'user', // Note lowercase - must match your schema expectations
            target: req.userId,
          };
        }
        console.log(`[MusicController] Checking access with ABAC`);
        // Check access using ABAC
        const accessResult = await this.abac.checkAccess({
          user: req.userId,
          resource: this.model.collection.collectionName,
          action: 'create',
          data: req.body,
        });
        console.log(`[MusicController] Access check result:`, accessResult);
        if (!accessResult.allowed) {
          console.error(`[MusicController] Access denied:`, accessResult.reason);
          return res.status(403).json({
            errorCode: accessResult.reason,
            message: 'Access Denied',
          });
        }
        console.log(`[MusicController] Creating record with data:`, req.body);
        // Continue with the creation
        const createdData = await this.model.create(req.body);
        await this.cache.flush();
        console.log(`[MusicController] Record created successfully:`, createdData._id);
        res.status(201).json(createdData);
      } catch (error) {
        console.error(`[MusicController] Error creating record:`, error);
        this.logger.error(`Error creating ${this.model.collection.collectionName}: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Override the update method to check ownership
    async update(req, res) {
      try {
        const resourceId = req.body._id;
        const resource = await this.model.findById(resourceId);
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        // Check access using ABAC
        const accessResult = await this.abac.checkAccess({
          user: req.userId,
          resource: this.model.collection.collectionName,
          action: 'update',
          data: req.body,
          currentResource: resource,
        });
        if (!accessResult.allowed) {
          return res.status(403).json({
            errorCode: accessResult.reason,
            message: 'Access Denied',
          });
        }
        // Continue with the update
        const updatedData = await this.model.findOneAndUpdate({ _id: resourceId }, req.body, {
          new: true,
          runValidators: true,
        });
        await this.cache.flush();
        res.json(updatedData);
      } catch (error) {
        this.logger.error(`Error updating ${this.model.collection.collectionName}: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Override the delete method to check ownership
    async delete(req, res) {
      try {
        const resourceId = req.body._id;
        const resource = await this.model.findById(resourceId);
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        // Check access using ABAC
        const accessResult = await this.abac.checkAccess({
          user: req.userId,
          resource: this.model.collection.collectionName,
          action: 'delete',
          data: req.body,
          currentResource: resource,
        });
        if (!accessResult.allowed) {
          return res.status(403).json({
            errorCode: accessResult.reason,
            message: 'Access Denied',
          });
        }
        // Continue with the deletion
        await this.model.findOneAndDelete({ _id: resourceId });
        await this.cache.flush();
        res.status(204).send();
      } catch (error) {
        this.logger.error(`Error deleting ${this.model.collection.collectionName}: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  }
  return {
    MusicController,
  };
});
