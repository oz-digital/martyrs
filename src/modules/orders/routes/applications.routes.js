import CRUD from '@martyrs/src/modules/globals/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';
import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
import axios from 'axios';

import verifierFactory from '../middlewares/applications.verifier.js';

const { getInstance } = ABAC;

export default function setupApplicationsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = verifierFactory(db);

  const applicationsCRUD = new CRUD({
    app,
    db,
    model: db.application,
    modelName: 'application',
    basePath: '/api/applications',

    auth: true, 

    verifiers: {
      create: verifier.createVerifier,
      read: verifier.readVerifier,
      update: verifier.updateVerifier,
      delete: verifier.deleteVerifier
    },
    
    abac: abac,
    
    cache: {
      enabled: true,
      ttl: 300,
      tags: ['application', 'orders']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  // Добавляем кастомный роут для телеграм вебхука
  applicationsCRUD.addAction('telegram-webhook', {
    method: 'post',
    path: '/telegram-webhook',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      const update = req.body;
      
      if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const callbackData = callbackQuery.data;
        const [action, applicationId] = callbackData.split('_');
        
        try {
          let updatedApplication = null;
          switch (action) {
            case 'confirm':
              updatedApplication = await db.application.findOneAndUpdate({ _id: applicationId }, { status: 'confirmed' }, { new: true });
              break;
            case 'lost':
              updatedApplication = await db.application.findOneAndUpdate({ _id: applicationId }, { status: 'lost' }, { new: true });
              break;
            case 'delete':
              updatedApplication = await db.application.findOneAndDelete({ _id: applicationId });
              break;
          }
          
          if (!updatedApplication) {
            console.log('Application not found or not updated.');
          } else {
            console.log('Application updated:', updatedApplication);
          }
        } catch (err) {
          console.log('Error updating application:', err);
        }
        
        const queryId = callbackQuery.id;
        const telegramToken = '6206215053:AAHYCYzpFZF9jDZC-TC03NSff8oo2ExqsSU';
        axios.post(`https://api.telegram.org/bot${telegramToken}/answerCallbackQuery`, {
          callback_query_id: queryId,
        });
      }
      
      res.sendStatus(200);
    }
  });

  // Добавляем публичный роут для создания заявок пользователями
  applicationsCRUD.addAction('public-create', {
    method: 'post',
    path: '/public',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const applicationData = {
          ...req.body,
          owner: {
            type: 'platform',
            target: '000000000000000000000000' // заглушка для отдела платформы
          },
          creator: {
            type: 'platform',
            target: '000000000000000000000000'
          }
        };

        const application = new db.application(applicationData);
        const saved = await application.save();
        
        res.status(201).json(saved);
      } catch (error) {
        console.error('Error creating public application:', error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return applicationsCRUD;
}