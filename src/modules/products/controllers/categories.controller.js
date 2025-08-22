import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import globalsQuery from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';

const controllerFactory = db => {
  const Category = db.category;
  const logger = new Logger(db);
  const cache = new Cache();

  // Генерация уникального slug
  const generateSlug = async (name, parentId = null) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Category.exists({ slug, parent: parentId })) {
      slug = `${baseSlug}-${counter++}`;
    }
    
    return slug;
  };

  // Построение дерева из плоского массива используя url
  const buildTreeFromUrl = (categories, sortParam = 'order', sortOrder = 'asc') => {
    // Сортируем по url для правильного порядка обработки
    categories.sort((a, b) => a.url.localeCompare(b.url));
    
    const tree = [];
    const nodeMap = new Map();
    
    categories.forEach(cat => {
      const node = { ...cat, children: [] };
      nodeMap.set(cat.url, node);
      

      // Находим родителя по url
      const parentUrl = cat.url.substring(0, cat.url.lastIndexOf('/'));
      
      if (parentUrl && nodeMap.has(parentUrl)) {
        nodeMap.get(parentUrl).children.push(node);
      } else if (cat.level === 0) {
        tree.push(node);
      }
    });
    
    // Рекурсивная сортировка
    const sortNodes = nodes => {
      nodes.sort((a, b) => {
        const va = a[sortParam] ?? Number.MAX_SAFE_INTEGER;
        const vb = b[sortParam] ?? Number.MAX_SAFE_INTEGER;
        const diff = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortOrder === 'asc' ? diff : -diff;
      });
      nodes.forEach(n => n.children?.length && sortNodes(n.children));
    };
    
    sortNodes(tree);
    return tree;
  };

  // Обновление пути категории и всех потомков
  const updateCategoryPaths = async (categoryId, newParentId = null) => {
    // Загружаем категорию и родителя параллельно для скорости
    const [category, parent] = await Promise.all([
      Category.findById(categoryId).lean(),
      newParentId ? Category.findById(newParentId).lean() : null
    ]);
    
    if (!category) {
      console.log('Category not found');
      return;
    }
    
    const oldUrl = category.url;
    const oldLevel = category.level;
    const oldParent = category.parent ? category.parent.toString() : null;
    
    // Если parent не изменился, не нужно обновлять пути
    const newParentStr = newParentId ? newParentId.toString() : null;
    if (oldParent === newParentStr) {
      console.log('Parent not changed, skipping path update');
      return;
    }
    
    let newLevel = 0;
    let newUrl = `/${category.slug}`;
    
    if (parent) {
      newLevel = parent.level + 1;
      newUrl = `${parent.url}/${category.slug}`;
    }
    
    // Если URL не изменился, ничего не делаем
    if (oldUrl === newUrl) {
      console.log('URL not changed, skipping update');
      return;
    }
    
    console.log(`URL change: "${oldUrl}" -> "${newUrl}"`);
    
    // Подготавливаем bulk операции для обновления категории и всех потомков
    const bulkOps = [];
    
    // Обновление самой категории
    bulkOps.push({
      updateOne: {
        filter: { _id: categoryId },
        update: { 
          $set: { 
            level: newLevel, 
            url: newUrl, 
            parent: newParentId 
          } 
        }
      }
    });
    
    // Обновление всех потомков - используем aggregation pipeline
    const levelDiff = newLevel - oldLevel;
    const oldUrlLength = oldUrl.length;
    
    // Обновляем потомков без предварительного подсчета
    bulkOps.push({
      updateMany: {
        filter: { url: { $regex: `^${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/` } },
        update: [
          {
            $set: {
              url: { 
                $concat: [
                  newUrl, 
                  { $substr: ['$url', oldUrlLength, -1] }
                ]
              },
              level: { $add: ['$level', levelDiff] }
            }
          }
        ]
      }
    });
    
    // Выполняем все операции одним запросом
    const result = await Category.bulkWrite(bulkOps, { ordered: false });
    console.log(`Updated ${result.modifiedCount} documents`);
  };

  return {
    async read(req, res) {
      try {
        const { 
          _id,
          parent, 
          url, 
          status, 
          search, 
          sortParam = 'order',
          sortOrder = 'asc', 
          skip,
          limit, 
          root = false,
          owner, 
          type,
          tree,
          depth = -1
        } = req.query;
        
        // Преобразуем depth в число
        const depthNum = parseInt(depth, 10);
        const isTree = tree === 'true' || tree === true;
        const isRoot = root === 'true' || root === true;
        
        console.log('🚀 Read categories params:', { url, depth: depthNum, tree: isTree, root });
        
        const cacheKey = JSON.stringify(req.query);
        const cached = await cache.get(cacheKey);
        if (cached) return res.json(cached);

        // Базовая фильтрация
        const match = {
          ...(_id && { _id: new db.mongoose.Types.ObjectId(_id) }),
          ...(status && { status }),
          ...(search && { name: { $regex: search, $options: 'i' } }),
          ...(type && { 'owner.type': type }),
          ...(owner && { 'owner.target': new db.mongoose.Types.ObjectId(owner) }),
          ...(parent && { parent: new db.mongoose.Types.ObjectId(parent) }), // Исправлено: было owner вместо parent
        };

        // Обработка URL параметра (только если не ищем по _id)
        if (url && !_id) {
          if (depth === 0) {
            // Только точное совпадение
            match.url = url;
          } else if (depth === 1) {
            // Категория + прямые дети
            match.$or = [
              { url: url },
              { url: { $regex: '^${url}/[^/]+$' } }
            ];
          } else {
            // Категория + все потомки (или ограничено depth)
            match.$or = [
              { url: url },
              { url: { $regex: `^${url}/` } }
            ];
          }
        } else if (isRoot && !_id) {
          // Только корневые категории
          match.url = { $regex: '^/[^/]+$' };
        }

        console.log('🔎 Match object:', JSON.stringify(match, null, 2));

        const pipeline = [
          { $match: match },
          ...globalsQuery.getSortingOptions(sortParam, sortOrder),
          // ...(skip || limit ? globalsQuery.getPaginationOptions(skip, limit) : []),
        ];
        
        console.log('🔧 Pipeline:', JSON.stringify(pipeline, null, 2));

        let results = await Category.aggregate(pipeline);
        console.log('🔍 Aggregate results:', results.length, 'categories found');
        console.log('🔍 Results URLs:', results.map(r => r.url));

        // Фильтрация по глубине если указан depth > 1 и url
        if (url && depthNum > 1) {
          const maxLevel = url.split('/').filter(Boolean).length + depthNum - 1;
          results = results.filter(cat => {
            const catLevel = cat.url.split('/').filter(Boolean).length;
            return cat.url === url || catLevel <= maxLevel;
          });
          console.log('🔍 After depth filter:', results.length, 'categories');
        }

        // Построение дерева
        if (isTree && results.length > 0) {
          console.log('🌳 Building tree from results');
          results = buildTreeFromUrl(results, sortParam, sortOrder);
        } else if (!isTree && depthNum === 1 && url && results.length > 0) {
          console.log('📋 Processing tree=false, depth=1');
          console.log('📋 Looking for main category with url:', url);
          
          const mainCategory = results.find(c => c.url === url);
          console.log('📋 Main category found:', !!mainCategory, mainCategory?.url);
          
          if (mainCategory) {
            const children = results.filter(c => 
              c.url !== url && c.url.startsWith(url + '/')
            );
            console.log('📋 Children found:', children.length, children.map(c => c.url));
            
            mainCategory.children = children;
            results = [mainCategory];
            console.log('📋 Final result with children:', results[0].url, 'children:', results[0].children.length);
          } else {
            console.log('❌ Main category not found in results!');
          }
        }

        // Кеширование
        const tags = ['categories'];
        if (owner) tags.push(`organization_${owner}`);
        await cache.setWithTags(cacheKey, results, tags);
        
        console.log('✅ Final results count:', results.length);
        res.json(results);
      } catch (err) {
        logger.error(`Error reading categories: ${err.message}`);
        res.status(500).json({ message: err.message });
      }
    },

    async create(req, res) {
      try {
        const data = req.verifiedBody;
        
        // Установка creator и owner
        data.creator ||= { type: 'user', target: req.userId };
        data.owner ||= req.query.owner 
          ? { type: 'organization', target: req.query.owner }
          : { type: 'platform', target: null };

        // Генерация slug
        const slug = await generateSlug(data.name, data.parent);

        // Определение level, url
        let level = 0;
        let url = `/${slug}`;

        if (data.parent) {
          const parent = await Category.findById(data.parent);
          if (!parent) throw new Error('Parent category not found');
          
          level = parent.level + 1;
          url = `${parent.url}/${slug}`;
        }

        // Определение order
        const maxOrder = await Category.findOne({ parent: data.parent || null })
          .sort('-order')
          .select('order');
        const order = (maxOrder?.order || 0) + 1;

        const category = await Category.create({
          ...data,
          slug,
          url,
          level,
          order,
        });

        // Очистка кеша
        await cache.delByTags(['categories']);
        if (category.owner.type === 'organization') {
          await cache.delByTag(`organization_${category.owner.target}`);
        }

        logger.info(`Category created: ${category._id}`);
        res.status(201).json(category);
      } catch (err) {
        logger.error(`Error creating category: ${err.message}`);
        res.status(err.message.includes('not found') ? 404 : 500)
          .json({ message: err.message });
      }
    },

    async update(req, res) {
      try {
        const data = req.verifiedBody;
        const oldCategory = await Category.findById(data._id);
        
        if (!oldCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }

        // Если меняется parent, обновляем пути
        if (data.parent !== undefined && data.parent != oldCategory.parent) {
          await updateCategoryPaths(data._id, data.parent);
        }

        const updated = await Category.findByIdAndUpdate(
          data._id, 
          { $set: data }, 
          { new: true }
        ).lean();

        // Очистка кеша
        await cache.delByTags(['categories']);
        if (updated.owner?.type === 'organization') {
          await cache.delByTag(`organization_${updated.owner.target}`);
        }

        logger.info(`Category updated: ${data._id}`);
        res.json(updated);
      } catch (err) {
        logger.error(`Category update error: ${err.message}`);
        res.status(500).json({ message: 'Failed to update category' });
      }
    },

    async updateOrder(req, res) {
      const startTime = Date.now();
      try {
        // ОДИН КОНСОЛЬ ЛОГ НА БЕКЕНДЕ - ЧТО ПРИШЛО
        console.log('📥 BACKEND RECEIVED:', JSON.stringify(req.body, null, 2));
        
        const { movedCategory, affectedCategories } = req.verifiedBody;
        
        if (!affectedCategories || affectedCategories.length === 0) {
          return res.json({ message: 'No changes to update' });
        }
        
        // Создаем bulk операции для обновления order всех затронутых категорий
        const bulkOps = affectedCategories.map(cat => ({
          updateOne: {
            filter: { _id: cat._id },
            update: { $set: { order: cat.order } }
          }
        }));
        
        // Выполняем все обновления одним запросом
        console.log(`Starting bulkWrite with ${bulkOps.length} operations`);
        const bulkStart = Date.now();
        await Category.bulkWrite(bulkOps, { ordered: false });
        console.log(`BulkWrite completed in ${Date.now() - bulkStart}ms`);
        
        // Если категория переместилась, обновляем URL для нее и всех потомков
        if (movedCategory) {
          const pathStart = Date.now();
          console.log('Starting updateCategoryPaths...');
          await updateCategoryPaths(movedCategory._id, movedCategory.newParent);
          console.log(`updateCategoryPaths completed in ${Date.now() - pathStart}ms`);
        }
        
        const cacheStart = Date.now();
        await cache.delByTags(['categories']);
        console.log(`Cache clear completed in ${Date.now() - cacheStart}ms`);

        const totalTime = Date.now() - startTime;
        console.log(`=== UPDATE ORDER COMPLETE in ${totalTime}ms ===`);
        
        logger.info(`Categories order updated: ${affectedCategories.length} items in ${totalTime}ms`);
        res.json({ message: 'Order updated successfully' });
      } catch (err) {
        logger.error(`Category order update error: ${err.message}`);
        console.error('Full error:', err);
        res.status(500).json({ message: 'Failed to update categories order' });
      }
    },

    async delete(req, res) {
      try {
        const category = req.currentResource;
        
        // Переносим дочерние категории к родителю удаляемой
        await Category.updateMany(
          { parent: category._id },
          { 
            $set: { parent: category.parent },
            $inc: { level: -1 }
          }
        );

        // Обновляем url потомков если есть
        if (category.parent) {
          const parent = await Category.findById(category.parent);
          const children = await Category.find({ parent: category.parent });
          
          for (const child of children) {
            await updateCategoryPaths(child._id, category.parent);
          }
        }

        await Category.deleteOne({ _id: category._id });

        // Очистка кеша
        await cache.delByTags(['categories']);
        if (category.owner?.type === 'organization') {
          await cache.delByTag(`organization_${category.owner.target}`);
        }

        logger.info(`Category deleted: ${category.slug}`);
        res.json({ message: 'Category deleted successfully' });
      } catch (err) {
        logger.error(`Error deleting category: ${err.message}`);
        res.status(500).json({ message: err.message });
      }
    },
  };
};

export default controllerFactory;