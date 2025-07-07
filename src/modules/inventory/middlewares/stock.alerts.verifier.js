import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания алертов
  const createVerifier = new Verifier({
    product: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Product ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format')
    },
    variant: {
      rule: 'optional',
      default: null,
      validator: Validator.schema()
        .oneOfTypes(['string', 'null'], 'Variant must be a valid ID or null')
        .custom(value => {
          if (value === null) return true;
          return /^[0-9a-fA-F]{24}$/.test(value);
        }, 'Invalid variant ID format')
    },
    storage: {
      rule: 'optional',
      default: null,
      validator: Validator.schema()
        .oneOfTypes(['string', 'null'], 'Storage must be a valid ID or null')
        .custom(value => {
          if (value === null) return true;
          return /^[0-9a-fA-F]{24}$/.test(value);
        }, 'Invalid storage ID format')
    },
    threshold: {
      rule: 'required',
      validator: Validator.schema()
        .number()
        .required('Threshold is required')
        .min(0, 'Threshold cannot be negative')
    },
    enabled: {
      rule: 'optional',
      default: true,
      validator: Validator.schema()
        .boolean()
    },
    owner: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    },
    creator: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    }
  });

  // Верификатор для обновления алертов
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Alert ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format')
    },
    product: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format')
    },
    variant: {
      rule: 'optional',
      validator: Validator.schema()
        .oneOfTypes(['string', 'null'], 'Variant must be a valid ID or null')
        .custom(value => {
          if (value === null) return true;
          return /^[0-9a-fA-F]{24}$/.test(value);
        }, 'Invalid variant ID format')
    },
    storage: {
      rule: 'optional',
      validator: Validator.schema()
        .oneOfTypes(['string', 'null'], 'Storage must be a valid ID or null')
        .custom(value => {
          if (value === null) return true;
          return /^[0-9a-fA-F]{24}$/.test(value);
        }, 'Invalid storage ID format')
    },
    threshold: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
        .min(0, 'Threshold cannot be negative')
    },
    enabled: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    }
  });

  // Верификатор для чтения алертов
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format')
    },
    product: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format')
    },
    variant: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid variant ID format')
    },
    storage: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid storage ID format')
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid owner ID format')
    },
    enabled: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
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
        .oneOf(['threshold', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления алертов
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Alert ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}