import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default (function (db) {
  // Функция для генерации slug из имени
  const generateSlug = (name, existingSlugs = []) => {
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  };

  // Конфигурация валидатора для запросов
  const queryValidatorConfig = {
    parent: { rule: 'optional', validator: Validator.schema().string() },
    slug: { rule: 'optional', validator: Validator.schema().string() },
    url: { rule: 'optional', validator: Validator.schema().string() },
    parentUrl: { rule: 'optional', validator: Validator.schema().string() },
    search: { rule: 'optional', validator: Validator.schema().string() },
    sortParam: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['order', 'name', 'createdAt', 'updatedAt']),
      default: 'order',
    },
    sortOrder: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['asc', 'desc']),
      default: 'asc',
    },
    skip: { rule: 'optional', validator: Validator.schema().number().integer().min(0), default: 0 },
    limit: {
      rule: 'optional',
      validator: Validator.schema().number().integer().min(1).max(100),
      default: 10,
    },
    excludeChildren: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['true', 'false']),
      default: 'true',
    },
    rootOnly: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['true', 'false']),
      default: 'false',
    },
    status: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['draft', 'internal', 'published', 'removed']),
    },
    type: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['platform', 'organization', 'all']),
      default: 'all',
    },
    organizationId: { rule: 'optional', validator: Validator.schema().string() },
  };
  const bodyValidatorConfig = {
    _id: { rule: 'optional', validator: Validator.schema().string() },
    name: { rule: 'optional', validator: Validator.schema().string().required() },
    description: { rule: 'optional', validator: Validator.schema().string() },
    photo: { rule: 'optional', validator: Validator.schema().string() },
    status: {
      rule: 'optional',
      validator: Validator.schema().string().oneOf(['draft', 'internal', 'published', 'removed']),
      default: 'draft',
    },
    slug: { rule: 'optional', validator: Validator.schema().string() },
    parent: { rule: 'optional', validator: Validator.schema().oneOfTypes(['string', 'null']) },
    localization: { rule: 'optional' },
    filters: { 
      rule: 'optional',
      validator: Validator.schema().array().items(
        Validator.schema().object({
          name: Validator.schema().string(),
          options: Validator.schema().array().items(Validator.schema().string())
        })
      )
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['platform', 'organization']).required(),
        target: Validator.schema().string(),
      }),
    },
    creator: {
      rule: 'optional',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization']).required(),
        target: Validator.schema().string(),
      }),
    },
    children: { rule: 'optional', validator: Validator.schema().array() },
    order: { rule: 'optional', validator: Validator.schema().number() },
  };
  const orderBodyValidatorConfig = {
    movedCategory: {
      rule: 'optional',
      validator: Validator.schema().object({
        _id: Validator.schema().string().required(),
        newParent: Validator.schema().oneOfTypes(['string', 'null'])
      })
    },
    affectedCategories: {
      rule: 'optional',
      validator: Validator.schema().array(),
      default: [],
    },
  };
  const deleteBodyValidatorConfig = {
    _id: {
      rule: 'optional',
      validator: Validator.schema().string().required(),
    },
  };
  const queryVerifier = new Verifier(queryValidatorConfig);
  const bodyVerifier = new Verifier(bodyValidatorConfig);
  const orderBodyVerifier = new Verifier(orderBodyValidatorConfig);
  const deleteBodyVerifier = new Verifier(deleteBodyValidatorConfig);
  return {
    // Верификация параметров запроса
    verifyQuery(req, res, next) {
      const verification = queryVerifier.verify(req.query);

      console.log('verification is', verification)
      if (!verification.isValid) {
        return res.status(400).json({
          errors: verification.verificationErrors,
          message: 'Invalid query parameters',
        });
      }
      req.verifiedQuery = verification.verifiedData;
      next();
    },
    // Верификация тела запроса для создания/обновления категории
    verifyBody(req, res, next) {
      const verification = bodyVerifier.verify(req.body);
      if (!verification.isValid) {
        return res.status(400).json({
          errors: verification.verificationErrors,
          message: 'Invalid request data',
        });
      }
      req.verifiedBody = verification.verifiedData;
      next();
    },
    // Верификация тела запроса для обновления порядка категорий
    verifyOrderBody(req, res, next) {
      const verification = orderBodyVerifier.verify(req.body);
      if (!verification.isValid) {
        return res.status(400).json({
          errors: verification.verificationErrors,
          message: 'Invalid request data',
        });
      }
      req.verifiedBody = verification.verifiedData;
      next();
    },
    // Верификация тела запроса для удаления категории
    verifyDeleteBody(req, res, next) {
      const verification = deleteBodyVerifier.verify(req.body);
      if (!verification.isValid) {
        return res.status(400).json({
          errors: verification.verificationErrors,
          message: 'Invalid request data',
        });
      }
      req.verifiedBody = verification.verifiedData;
      next();
    },
    // Проверка на существование категории с тем же slug в рамках parent
    async checkCategoryExistOrNot(req, res, next) {
      try {
        const { name, parent, slug } = req.verifiedBody;
        
        if (!name) {
          return res.status(400).json({ message: 'Name is required' });
        }

        // Генерируем slug если не передан
        let categorySlug = slug;
        if (!categorySlug) {
          // Получаем существующие slug в рамках parent
          const existingSlugs = await db.category.find({
            parent: parent || null
          }).distinct('slug');
          
          categorySlug = generateSlug(name, existingSlugs);
          req.verifiedBody.slug = categorySlug;
        } else {
          // Проверяем уникальность переданного slug
          const existingCategory = await db.category.findOne({ 
            slug: categorySlug, 
            parent: parent || null 
          });
          
          if (existingCategory) {
            return res.status(409).json({
              message: 'Category with this slug already exists in this parent',
              category: existingCategory,
            });
          }
        }
        
        next();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    // Загрузка категории для проверки ABAC (для обновления и удаления)
    async loadCategoryForUpdate(req, res, next) {
      try {
        const categoryId = req.verifiedBody._id;
        if (!categoryId) {
          return res.status(400).json({ message: 'Category ID is required' });
        }
        const category = await db.category.findById(categoryId).lean();
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
        req.currentResource = category; // Устанавливаем для ABAC
        next();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    // Загрузка категории по _id для удаления
    async loadCategoryForDelete(req, res, next) {
      try {
        const _id = req.verifiedBody._id;
        if (!_id) {
          return res.status(400).json({ message: 'Category _id is required' });
        }
        const category = await db.category.findById(_id).lean();
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
        req.currentResource = category; // Устанавливаем для ABAC
        next();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
  };
});
