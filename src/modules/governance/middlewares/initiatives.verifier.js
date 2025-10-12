import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default function(db) {

  // Верификатор для создания инициатив
  const createVerifier = new Verifier({
    name: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Initiative name is required')
        .min(1, 'Name cannot be empty')
        .max(200, 'Name must not exceed 200 characters')
    },
    title: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(200, 'Title must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Description must not exceed 2000 characters')
    },
    status: {
      rule: 'optional',
      default: 'draft',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'active', 'completed', 'archived'], 'Invalid status')
    },
    client: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'Client name must not exceed 100 characters')
    },
    url: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(200, 'URL must not exceed 200 characters')
    },
    createdBy: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    },
    cover: {
      rule: 'optional'
    },
    published: {
      rule: 'optional'
    },
    structure: {
      rule: 'optional'
    },
    team: {
      rule: 'optional'
    },
    services: {
      rule: 'optional'
    },
    date: {
      rule: 'optional'
    }
  });

  // Верификатор для чтения инициатив
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'active', 'completed', 'archived'], 'Invalid status')
    },
    createdBy: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    },
    limit: {
      rule: 'optional',
      validator: Validator.schema()
        .integer()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
    },
    skip: {
      rule: 'optional',
      validator: Validator.schema()
        .integer()
        .min(0, 'Skip cannot be negative')
    },
    sort: {
      rule: 'optional'
    },
    populate: {
      rule: 'optional'
    }
  });

  // Верификатор для обновления инициатив
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Initiative ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    },
    name: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name cannot be empty')
        .max(200, 'Name must not exceed 200 characters')
    },
    title: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(200, 'Title must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Description must not exceed 2000 characters')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'active', 'completed', 'archived'], 'Invalid status')
    },
    client: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'Client name must not exceed 100 characters')
    },
    url: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(200, 'URL must not exceed 200 characters')
    },
    cover: {
      rule: 'optional'
    },
    published: {
      rule: 'optional'
    },
    structure: {
      rule: 'optional'
    },
    team: {
      rule: 'optional'
    },
    services: {
      rule: 'optional'
    },
    date: {
      rule: 'optional'
    }
  });

  // Верификатор для удаления инициатив
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Initiative ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}