import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default (function (db) {

  // Верификатор для создания
  const createVerifier = new Verifier({
    name: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Variant name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .length({ max: 5000 }, 'Description must not exceed 5000 characters')
    },
    sku: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens and underscores')
        .max(50)
    },
    price: {
      rule: 'required',
      validator: Validator.schema()
        .number()
        .required('Price is required')
        .min(0, 'Price cannot be negative')
    },
    cost: {
      rule: 'optional',
      default: 0,
      validator: Validator.schema()
        .number()
        .min(0, 'Cost cannot be negative')
    },
    quantity: {
      rule: 'optional',
      default: 1,
      validator: Validator.schema()
        .number()
        .min(0, 'Quantity cannot be negative')
    },
    unit: {
      rule: 'optional',
      default: 'pcs',
      validator: Validator.schema()
        .string()
        .oneOf(['pcs', 'g', 'kg', 'ml', 'l', 'oz'], 'Invalid unit')
    },
    images: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(Validator.schema().string())
    },
    ingredients: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema().object({
            name: Validator.schema().string().required(),
            quantity: Validator.schema().number().min(0),
            unit: Validator.schema().string()
          })
        )
    },
    attributes: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema().object({
            name: Validator.schema().string().required(),
            value: Validator.schema().string().required()
          })
        )
    },
    owner: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    }
  });

  // Верификатор для обновления
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Variant ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
    },
    name: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .length({ max: 5000 }, 'Description must not exceed 5000 characters')
    },
    sku: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens and underscores')
        .max(50)
    },
    price: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
        .min(0, 'Price cannot be negative')
    },
    cost: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
        .min(0, 'Cost cannot be negative')
    },
    quantity: {
      rule: 'optional',
      validator: Validator.schema()
        .integer()
        .min(0, 'Quantity cannot be negative')
    },
    unit: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['pcs', 'g', 'kg', 'ml', 'l', 'oz'], 'Invalid unit')
    },
    images: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(Validator.schema().string())
    },
    ingredients: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema().object({
            name: Validator.schema().string().required(),
            quantity: Validator.schema().number().min(0),
            unit: Validator.schema().string()
          })
        )
    },
    attributes: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema().object({
            name: Validator.schema().string().required(),
            value: Validator.schema().string().required()
          })
        )
    }
  });

  // Верификатор для чтения
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema().string()
    },
    skip: {
      rule: 'optional',
      default: 0,
      validator: Validator.schema()
        .integer()
        .min(0)
    },
    limit: {
      rule: 'optional',
      default: 20,
      validator: Validator.schema()
        .integer()
        .min(1)
        .max(100)
    },
    sortParam: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['name', 'price', 'quantity', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Variant ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/)
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
});
