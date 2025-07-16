import ChatGPT from '@martyrs/src/modules/integrations/openai/openai.globals.js';

import queryProcessorGlobals from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
import queryProcessorProducts from '@martyrs/src/modules/products/controllers/queries/products.queries.js';

import productLookupConfigs from '@martyrs/src/modules/products/controllers/configs/products.lookup.config.js';

const controllerFactory = db => {
  const Product = db.product;

  const Create = async (req, res) => {
    try {
      const productData = {
        ...req.body,
        category: req.body.category?.map(cat => cat._id) || []
      };
      
      const product = await new Product(productData).save();
      return res.status(201).json(product);
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: err.message });
    }
  };

  // Read products
  const Read = async (req, res) => {
    try {
      const requestedLookups = queryProcessorGlobals.getRequestedLookups(req.query);
      
      const stages = [
        ...queryProcessorGlobals.getBasicOptions(req.query),
        ...queryProcessorGlobals.getSearchOptions(req.query.search, {
          fields: ['name', 'description']
        }),
        ...queryProcessorGlobals.getFilterDate(req.query.dateStart, req.query.dateEnd, {
          start: 'startDate',
          end: 'endDate',
        }),
        ...queryProcessorProducts.getCategoriesFilterStage(req.query.categories),
        ...queryProcessorProducts.getDeliveryFilterStage(req.query.delivery),
        ...queryProcessorProducts.getAttributeFiltersStage(req.query.filters),
        ...queryProcessorProducts.getVariantPriceFilterStage(req.query.prices),
        ...queryProcessorProducts.getAvailabilityFilterStage(req.query.dateStart, req.query.dateEnd),
        ...queryProcessorGlobals.getLookupStages(requestedLookups, productLookupConfigs),
        
        queryProcessorGlobals.getCreatorUserLookupStage(),
        queryProcessorGlobals.getCreatorOrganizationLookupStage(),
        queryProcessorGlobals.getOwnerUserLookupStage(),
        queryProcessorGlobals.getOwnerOrganizationLookupStage(),
        queryProcessorGlobals.getAddFieldsCreatorOwnerStage(),
        
        ...queryProcessorGlobals.getSortingOptions(req.query.sortParam, req.query.sortOrder),
        ...queryProcessorGlobals.getPaginationOptions(req.query.skip, req.query.limit),
        
        // Удаление временных полей
        queryProcessorGlobals.removeTempPropeties(),
        
        // Дополнительные очистки для lookup-ов
        ...(requestedLookups.includes('inventory') ? [{ $project: { availability: 0 } }] : [])
      ].filter(Boolean);
      
      // Выполнение агрегации
      const products = await Product.aggregate(stages);
      
      // Возвращаем только количество, если запрошено
      if (req.query.count) {
        return res.status(200).json({ count: products.length });
      }
      res.status(200).json(products);
    } catch (err) {
      console.error('Error in products Read controller:', err);
      return res.status(500).json({ message: err.message });
    }
  };

  const Update = async (req, res) => {
    try {
      const { _id } = req.params;

      const updateData = {
        name: req.body.name,
        status: req.body.status,
        listing: req.body.listing,
        description: req.body.description,
        category: req.body.category?.map(cat => cat._id) || [],
        images: req.body.images,
        attributes: req.body.attributes,
        recommended: req.body.recommended,
        localization: req.body.translations,
        discounts: req.body.discounts,
        included: req.body.included
      };
      
      const updatedProduct = await Product.findOneAndUpdate({ _id }, updateData, { new: true });
      
      if (!updatedProduct) {
        return res.status(404).send({ message: 'Something wrong when updating product.' });
      }

      res.status(200).send(updatedProduct);

    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };

  const Delete = async (req, res) => {
    try {
      const { _id } = req.params;
      const deletedProduct = await Product.findOneAndDelete({ _id });
      if (!deletedProduct) {
        return res.status(404).send({ message: 'Product not found for deletion.' });
      }
      res.status(200).send(deletedProduct);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  
  const getProductRecommendation = async (req, res) => {
    const { mood } = req.body;
    try {
      const products = await Product.find({
        status: 'published',
      }).limit(40);
      if (!products) {
        console.log('no products');
        return res.status(404).send({ message: 'Products not found.' });
      }
      const productsList = products
        .map(p => {
          const info = p.attributes || [];
          const value0 = info[0] ? info[0].value : '';
          const value1 = info[1] ? `(${info[1].value}%)` : '';
          const value2 = info[2] ? `(${info[2].value})` : '';
          return `${p._id}: ${p.name} (${value0}) ${value1} ${value2}`;
        })
        .join(', ');
      
      const prompt = `
        1. When asked how the client wants to feel, they responded "${mood}".
        2. Here is a list of products in our store: ${productsList}. 
        3. Based on the attributes about the products (strain, THC content) and the user's desires, choose 1 product to recommend to the user.
        4. The response should be in the language that the user used in mood (${mood}).
        5. Please format your response as a JSON object '{"_id": "ID of the recommended product (it must correspond to one of the product IDs I sent)", "recommendationText": "Text explaining why this particular product"'. Write only the JSON object without any other text outside of it.
      `;

      // Specify a model explicitly
      const result = await ChatGPT.createChatCompletion(prompt, {
        model: 'gpt-4',
        temperature: 0.8,
        systemPrompt: 'You are a product recommendation specialist with expertise in matching customer needs to product attributes.'
      });

      const recommendedProduct = await Product.findById(result._id);
      
      if (!recommendedProduct) {
        console.log(`No product found with _id: ${result._id}`);
        return res.status(404).send({ message: 'Recommended product not found.' });
      }
      res.status(200).json({ product: recommendedProduct, recommendationText: result.recommendationText });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err });
    }
  };

  return {
    Create,
    Read,
    Update,
    Delete,
    getProductRecommendation,
  };
};
export default controllerFactory;
