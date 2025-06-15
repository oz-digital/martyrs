import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import globalsQuery from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
const controllerFactory = db => {
  const Category = db.category;
  const logger = new Logger(db);
  const cache = new Cache();
  return {
    async read(req, res) {
      try {
        // Используем верифицированные данные из middleware
        let { parent, url, search, sortParam, sortOrder, skip, limit, excludeChildren, rootOnly, type } = req.verifiedQuery;
        // Формируем ключ кэша
        const cacheKey = JSON.stringify(req.verifiedQuery);
        // Проверяем наличие данных в кэше
        let cachedResult = await cache.get(cacheKey);

        if (cachedResult) {
          return res.status(200).json(cachedResult);
        }
        // Создаем условия для выборки категорий
        const matchStage = {
          ...(req.query.status && { status: req.query.status }),
          ...(url && { url: url }),
          ...(search && { name: { $regex: search, $options: 'i' } }),
          ...(parent ? { parent: new db.mongoose.Types.ObjectId(parent) } : {}),
          ...(rootOnly === 'true' && !search ? { parent: null } : {}),
        };
        // Добавляем фильтрацию по типу владельца
        if (type === 'platform') {
          matchStage['owner.type'] = 'platform';
        } else if (type === 'organization' && req.query.organizationId) {
          matchStage['owner.type'] = 'organization';
          matchStage['owner.target'] = new db.mongoose.Types.ObjectId(req.query.organizationId);
        }
        if (search) {
          excludeChildren = 'true';
        }
        // Базовый пайплайн для получения категорий
        let pipeline = [
          { $match: matchStage },
          globalsQuery.getCreatorUserLookupStage(),
          globalsQuery.getCreatorOrganizationLookupStage(),
          // For owner
          globalsQuery.getOwnerUserLookupStage(),
          globalsQuery.getOwnerOrganizationLookupStage(),
          globalsQuery.getAddFieldsCreatorOwnerStage(),
          { $sort: { [sortParam]: sortOrder === 'asc' ? 1 : -1 } },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
          globalsQuery.removeTempPropeties(),
        ];
        // Если дочерние категории не исключаются, добавляем этап для получения потомков
        if (excludeChildren !== 'true') {
          pipeline.push({
            $graphLookup: {
              from: 'categories',
              startWith: '$_id',
              connectFromField: '_id',
              connectToField: 'parent',
              as: 'allDescendants',
              maxDepth: 10,
            },
          });
        }
        // Выполняем агрегацию
        const results = await Category.aggregate(pipeline);
        let response;
        // Если исключаем дочерние категории, просто возвращаем результаты
        if (excludeChildren === 'true') {
          response = results;
        } else {
          // Объединяем все категории и их потомков в один массив
          let allCategories = [];
          results.forEach(doc => {
            // Добавляем текущую категорию (без allDescendants)
            let category = { ...doc };
            delete category.allDescendants;
            allCategories.push(category);
            // Добавляем потомков, если они есть
            if (doc.allDescendants && doc.allDescendants.length > 0) {
              allCategories.push(...doc.allDescendants);
            }
          });
          // Удаляем дубликаты категорий по ID
          let uniqueCategories = Array.from(new Map(allCategories.map(item => [item._id.toString(), item])).values());
          // Строим дерево категорий
          let tree = buildAdjacencyTree(uniqueCategories, sortParam, sortOrder);
          // Если rootOnly=true, возвращаем все корневые категории из дерева
          if (rootOnly === 'true') {
            response = tree;
          } else {
            // Иначе возвращаем только те корневые категории, которые соответствуют запросу
            const requestedCategoryIds = results.map(r => r._id.toString());
            response = tree.filter(category => requestedCategoryIds.includes(category._id.toString()));
          }
        }
        // Кэшируем результат с тегами для каждой категории
        let tags = ['categories'];
        // Добавляем тег для категорий организации, если применимо
        if (type === 'organization' && req.query.organizationId) {
          tags.push(`organization_${req.query.organizationId}`);
        }
        // Добавляем теги для отдельных категорий
        for (const cat of response) {
          if (cat._id) {
            tags.push(`category_${cat._id}`);
          }
        }
        await cache.setWithTags(cacheKey, response, tags);
        res.status(200).json(response);
      } catch (err) {
        console.log(err)
        logger.error(`Error reading categories: ${err.message}`);
        res.status(500).json({ message: err.message });
      }
    },
    async create(req, res) {
      try {
        // Используем верифицированные данные из middleware
        const categoryData = req.verifiedBody;
        // Если creator не задан, используем текущего пользователя
        if (!categoryData.creator && req.userId) {
          categoryData.creator = {
            type: 'user',
            target: req.userId,
          };
        }
        // Если owner не задан, определяем по типу
        if (!categoryData.owner) {
          // Если задан organizationId, то владельцем будет организация
          if (req.query.organizationId) {
            categoryData.owner = {
              type: 'organization',
              target: req.query.organizationId,
            };
          } else {
            // Иначе это платформенная категория
            categoryData.owner = {
              type: 'platform',
              target: null,
            };
          }
        }
        const highestOrder = await Category.findOne().sort('-order');
        const order = highestOrder ? highestOrder.order + 1 : 1;
        // Создаем категорию
        const category = new Category({
          ...categoryData,
          order,
        });
        // Обрабатываем родительскую категорию
        if (categoryData.parent) {
          const parent = await Category.findByIdAndUpdate(categoryData.parent, { $push: { children: category._id } }, { new: true });
          if (!parent) throw new Error('Parent category not found');
          category.parent = parent._id;
        }
        // Обрабатываем дочерние категории
        if (categoryData.children && categoryData.children.length > 0) {
          await Category.updateMany({ _id: { $in: categoryData.children } }, { $set: { parent: category._id } });
        }
        await category.save();
        // Очищаем кэш для категорий
        await cache.delByTags(['categories']);
        // Если категория принадлежит организации, очищаем ее кэш
        if (category.owner.type === 'organization') {
          await cache.delByTag(`organization_${category.owner.target}`);
        }
        logger.info(`Category created: ${category._id}`);
        res.status(201).json(category);
      } catch (err) {
        logger.error(`Error creating category: ${err.message}`);
        res.status(err.message === 'Parent category not found' ? 404 : 500).json({ message: err.message });
      }
    },
    async update(req, res) {
      try {
        // Используем верифицированные данные из middleware
        const category = req.verifiedBody;
        const updatedCategory = await Category.findByIdAndUpdate(category._id, { $set: category }, { new: true }).lean();
        // Категория уже проверена middleware, но на всякий случай перепроверим
        if (!updatedCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }
        // Очищаем кэш для этой категории
        await cache.delByTag(`category_${category._id}`);
        // Очищаем кэш для категорий
        await cache.delByTags(['categories']);
        // Если категория принадлежит организации, очищаем ее кэш
        if (updatedCategory.owner && updatedCategory.owner.type === 'organization') {
          await cache.delByTag(`organization_${updatedCategory.owner.target}`);
        }
        logger.info(`Category updated: ${category._id}`);
        res.status(200).json(updatedCategory);
      } catch (err) {
        logger.error(`Category update error: ${err.message}`);
        res.status(500).json({ message: 'Failed to update category' });
      }
    },
    async updateOrder(req, res) {
      try {
        // Используем верифицированные данные из middleware
        const { categories } = req.verifiedBody;
        const bulkOps = categories.map(category => ({
          updateOne: {
            filter: { _id: category._id },
            update: {
              $set: {
                order: category.order,
                parent: category.parent ? new db.mongoose.Types.ObjectId(category.parent) : null,
              },
            },
          },
        }));
        await Category.bulkWrite(bulkOps);
        // Собираем ID категорий и организаций для очистки кэша
        const categoryIds = categories.map(cat => cat._id);
        const organizationIds = new Set();
        // Получаем категории, чтобы выяснить, к каким организациям они принадлежат
        const updatedCategories = await Category.find({ _id: { $in: categoryIds } }).lean();
        // Собираем ID организаций
        updatedCategories.forEach(cat => {
          if (cat.owner && cat.owner.type === 'organization') {
            organizationIds.add(cat.owner.target.toString());
          }
        });
        // Очищаем кэш для категорий
        await cache.delByTags(['categories']);
        // Очищаем кэш для отдельных категорий
        for (const catId of categoryIds) {
          await cache.delByTag(`category_${catId}`);
        }
        // Очищаем кэш для организаций
        for (const orgId of organizationIds) {
          await cache.delByTag(`organization_${orgId}`);
        }
        // Получаем обновленные категории с учетом типа владельца
        let query = {};
        if (req.query.type === 'platform') {
          query = { 'owner.type': 'platform' };
        } else if (req.query.type === 'organization' && req.query.organizationId) {
          query = {
            'owner.type': 'organization',
            'owner.target': new db.mongoose.Types.ObjectId(req.query.organizationId),
          };
        }
        const result = await Category.find(query).sort({ order: 'asc' }).lean();
        logger.info(`Categories order updated: ${categoryIds.join(', ')}`);
        res.status(200).json(result);
      } catch (err) {
        logger.error(`Category order update error: ${err.message}`);
        res.status(500).json({ message: 'Failed to update categories order' });
      }
    },
    async delete(req, res) {
      try {
        // Категория уже загружена middleware
        const category = req.currentResource;
        // Сохраняем организацию владельца для очистки кэша
        let ownerOrgId = null;
        if (category.owner && category.owner.type === 'organization') {
          ownerOrgId = category.owner.target;
        }
        // Используем $graphLookup для поиска всех потомков
        const result = await Category.aggregate([
          { $match: { _id: category._id } },
          {
            $graphLookup: {
              from: 'categories',
              startWith: '$_id',
              connectFromField: '_id',
              connectToField: 'parent',
              as: 'descendants',
            },
          },
          {
            $project: { descendants: 1 },
          },
        ]);
        // Собираем id текущей категории и всех найденных потомков
        const idsToDelete = [category._id, ...(result[0]?.descendants || []).map(({ _id }) => _id)];
        // Собираем ID для очистки кэша
        const categoryIdsTags = idsToDelete.map(id => `category_${id}`);
        // Удаляем все категории одним запросом
        await Category.deleteMany({ _id: { $in: idsToDelete } });
        // Очищаем кэш для категорий
        await cache.delByTags(['categories']);
        // Очищаем кэш для отдельных категорий
        await cache.delByTags(categoryIdsTags);
        // Очищаем кэш для организации, если категория ей принадлежала
        if (ownerOrgId) {
          await cache.delByTag(`organization_${ownerOrgId}`);
        }
        logger.info(`Category and its subcategories deleted: ${category.url}`);
        res.status(200).json({ message: 'Category and its subcategories deleted successfully' });
      } catch (err) {
        logger.error(`Error deleting category: ${err.message}`);
        res.status(500).json({ message: err.message || 'Internal server error' });
      }
    },
  };
  // Вспомогательная функция для построения дерева категорий
  function buildAdjacencyTree(categories, sortParam, sortOrder) {
    // Создаем карту категорий по ID для быстрого доступа
    const categoryMap = new Map();
    // Инициализируем каждую категорию с пустым массивом children
    categories.forEach(category => {
      categoryMap.set(category._id.toString(), {
        ...category,
        children: [],
      });
    });
    // Строим дерево, связывая родительские и дочерние категории
    const rootCategories = [];
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category._id.toString());
      // Если у категории есть родитель и этот родитель есть в нашей карте
      if (category.parent && categoryMap.has(category.parent.toString())) {
        const parentCategory = categoryMap.get(category.parent.toString());
        parentCategory.children.push(categoryWithChildren);
      }
      // Иначе это корневая категория
      else if (!category.parent) {
        rootCategories.push(categoryWithChildren);
      }
    });
    // Рекурсивная функция для сортировки категорий на всех уровнях
    function sortCategories(nodes) {
      if (!nodes || nodes.length === 0) {
        return nodes;
      }
      // Сортируем текущий уровень
      nodes.sort((a, b) => {
        const valueA = a[sortParam] ?? (sortParam === 'order' ? Number.MAX_SAFE_INTEGER : '');
        const valueB = b[sortParam] ?? (sortParam === 'order' ? Number.MAX_SAFE_INTEGER : '');
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        } else {
          const stringA = String(valueA);
          const stringB = String(valueB);
          return sortOrder === 'asc' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
        }
      });
      // Рекурсивно сортируем дочерние категории
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortCategories(node.children);
        }
      });
      return nodes;
    }
    // Сортируем категории на всех уровнях и возвращаем результат
    return sortCategories(rootCategories);
  }
};
export default controllerFactory;
