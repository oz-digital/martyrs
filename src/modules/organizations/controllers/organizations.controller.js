import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import queryProcessorGlobals from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
import addMembersQuantity from '@martyrs/src/modules/organizations/controllers/utils/addMembersQuantity.js';
import addUserStatusFields from '@martyrs/src/modules/organizations/controllers/utils/addUserStatusFields.js';
import jwt from 'jsonwebtoken';
import lookupConfigs from './utils/lookupConfigs.js';
import {
  getBasicMatchConditions,
  getContainConditions,
  getLocationStages,
  getLookupStages,
  getPostableConditions,
  getPriceConditions,
  getRequestedLookups,
} from './utils/queryProcessorOrganizations.js';
const controllerFactory = db => {
  const Organization = db.organization;
  const Department = db.department;
  const Membership = db.membership;
  // Создаем экземпляр вашего кэша с TTL 5 минут (по умолчанию)
  const cache = new Cache({ ttlSeconds: 60 * 5 });
  const read = async (req, res) => {
    console.log('controller query', req.query);
    try {
      const cacheKey = JSON.stringify(req.query); // Ключ кэша на основе запроса
      // Проверяем, есть ли данные в кэше
      let cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        // Если данные в кэше есть, возвращаем их
        return res.status(200).send(cachedResult);
      }
      const requestedLookups = getRequestedLookups(req.query);
      const matchConditions = getBasicMatchConditions(req.query);
      const stages = [
        ...getLookupStages(requestedLookups, lookupConfigs),
        ...getPostableConditions(req.query.postable),
        ...getContainConditions(req.query.contain),
        ...queryProcessorGlobals.getSearchOptions(req.query.search, {
          fields: requestedLookups.includes('products') ? ['profile.name', 'products.name'] : ['profile.name'],
        }),
        ...(requestedLookups.includes('products') && req.query.prices ? getPriceConditions(req.query.prices) : []),
        ...(requestedLookups.includes('spots') ? (await getLocationStages(req.query)).stages : []),
        ...(requestedLookups.includes('memberships') ? [addUserStatusFields(req.query.user), addMembersQuantity(req.query.user)] : []),
        ...(matchConditions.length > 0 ? [{ $match: { $and: matchConditions } }] : []),
        ...queryProcessorGlobals.getSortingOptions(req.query.sortParam, req.query.sortOrder),
        ...queryProcessorGlobals.getPaginationOptions(req.query.skip, req.query.limit),
      ].filter(Boolean);
      console.log(JSON.stringify(stages, null, 2));
      const organizations = await Organization.aggregate(stages);
      // Кэшируем результат с тегами для каждой организации
      for (const org of organizations) {
        const orgTag = `organization_${org._id}`; // Уникальный тег для каждой организации
        await cache.setWithTags(cacheKey, organizations, [orgTag, 'organizations']); // Добавляем оба тега
      }
      res.status(200).send(organizations);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  };
  const create = async (req, res) => {
    if (req.body._id === null) {
      delete req.body._id;
    }
    try {
      const organization = new Organization(req.body);
      const savedOrganization = await organization.save();
      const membership = new Membership({
        user: savedOrganization.owner,
        type: 'organization',
        target: savedOrganization._id,
        role: 'owner',
        label: 'owner',
      });
      const savedMembership = await membership.save();
      // Очищаем кэш для этой организации
      const orgTag = `organization_${savedOrganization._id}`;
      await cache.delByTag(orgTag);
      // Convert the Mongoose document to a plain JavaScript object before caching
      const organizationObject = savedOrganization.toObject();
      // Обновляем кэш, добавляя новую организацию
      const newCacheKey = JSON.stringify({ id: organizationObject._id });
      await cache.setWithTags(newCacheKey, [organizationObject], [orgTag, 'organizations']);
      res.status(201).json(savedOrganization);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send(error);
    }
  };
  const update = async (req, res) => {
    try {
      const organizationId = req.params._id;
      const updatedData = req.body;
      const organization = await Organization.findByIdAndUpdate(organizationId, updatedData, {
        new: true,
        runValidators: true,
      });
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      // Очищаем кэш для этой организации
      const orgTag = `organization_${organizationId}`;
      await cache.delByTag(orgTag);
      // Преобразуем документ Mongoose в обычный объект перед кэшированием
      const organizationObject = organization.toObject();
      // Обновляем кэш новой версией организации
      const updateCacheKey = JSON.stringify({ _id: organizationId });
      await cache.setWithTags(updateCacheKey, [organizationObject], [orgTag, 'organizations']);
      res.status(200).json({ message: 'Organization updated successfully', organization });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  const deleteOrganization = async (req, res) => {
    try {
      const organization = await Organization.findOneAndRemove({ _id: req.params._id });
      if (!organization) {
        return res.status(404).send({ message: 'Organization not found' });
      }
      // Удаление всех memberships, связанных с этой организацией
      await Membership.deleteMany({ target: req.params._id });
      const newToken = jwt.sign(
        {
          _id: req.userId, // Предполагаю, что req.userId доступен
          organization: null,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: 86400, // 24 hours
        }
      );
      // Очищаем кэш для этой организации
      const orgTag = `organization_${req.params._id}`;
      await cache.delByTag(orgTag);
      res.send({ newToken });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const checkAccesses = async (req, res) => {
    try {
      const uid = new db.mongoose.Types.ObjectId(req.userId);
      const cacheKey = `accesses_${uid.toString()}`; // Уникальный ключ для кэша на основе userId
      // Проверяем, есть ли данные в кэше
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        return res.status(200).json(cachedResult);
      }
      const depts = await Department.find({ 'members.user': uid }).lean(); // Используем lean() для получения обычных объектов
      const ownedOrgs = await Organization.find({ owner: uid }).lean(); // Используем lean() для получения обычных объектов
      const ownedOrgIds = ownedOrgs.map(org => org._id.toString());
      const accesses = {};
      const processAccesses = (orgId, isOwner, deptAccesses) => {
        if (!accesses[orgId]) {
          accesses[orgId] = { organization: orgId, rights: {} };
        }
        const rights = accesses[orgId].rights;
        const defaultAccesses = new Department().accesses;
        const accessData = isOwner ? defaultAccesses : deptAccesses;
        Object.keys(accessData).forEach(key => {
          if (!rights[key]) {
            rights[key] = {};
          }
          const accessRights = accessData[key];
          Object.entries(accessRights).forEach(([right, value]) => {
            rights[key][right] = isOwner || rights[key][right] || value;
          });
        });
      };
      // Группируем департаменты по организациям
      const orgDepts = depts.reduce((acc, dept) => {
        const orgId = dept.organization.toString();
        if (!acc[orgId]) {
          acc[orgId] = [];
        }
        acc[orgId].push(dept);
        return acc;
      }, {});
      // Обрабатываем права доступа для каждой организации
      Object.entries(orgDepts).forEach(([orgId, departments]) => {
        const combinedAccesses = departments.reduce((acc, dept) => {
          Object.entries(dept.accesses).forEach(([key, rights]) => {
            if (!acc[key]) {
              acc[key] = {};
            }
            Object.entries(rights).forEach(([right, value]) => {
              acc[key][right] = acc[key][right] || value;
            });
          });
          return acc;
        }, {});
        processAccesses(orgId, false, combinedAccesses);
      });
      // Обрабатываем права доступа для организаций, которыми владеет пользователь
      ownedOrgIds.forEach(orgId => {
        processAccesses(orgId, true, {});
      });
      const accessArray = Object.values(accesses);
      // Кэшируем результат с тегами: уникальный тег для пользователя и общий тег для всех доступов
      const userTag = `access_${uid.toString()}`; // Тег для конкретного пользователя
      await cache.setWithTags(cacheKey, accessArray, [userTag, 'accesses']);
      res.status(200).json(accessArray);
    } catch (err) {
      console.error('Error getting accesses:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  return {
    fetch,
    read,
    create,
    update,
    delete: deleteOrganization, // Map the method to 'delete' key
    checkAccesses,
  };
};
export default controllerFactory;
