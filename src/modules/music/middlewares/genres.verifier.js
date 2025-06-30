// @martyrs/src/modules/music/middlewares/genres.verifier.js
import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания жанров
  const createVerifier = new Verifier({
    name: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Genre name is required')
        .min(1, 'Name cannot be empty')
        .max(50, 'Name must not exceed 50 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(500, 'Description must not exceed 500 characters')
    },
    iconUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^https?:\/\/.+/, 'Invalid icon URL format')
    },
    popularity: {
      rule: 'optional',
      default: 0,
      validator: Validator.schema()
        .number()
        .min(0, 'Popularity cannot be negative')
        .max(100, 'Popularity cannot exceed 100')
    }
  });

  // Верификатор для обновления жанров
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Genre ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
    },
    name: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name cannot be empty')
        .max(50, 'Name must not exceed 50 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(500, 'Description must not exceed 500 characters')
    },
    iconUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^https?:\/\/.+/, 'Invalid icon URL format')
    },
    popularity: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
        .min(0, 'Popularity cannot be negative')
        .max(100, 'Popularity cannot exceed 100')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'published', 'archived'], 'Invalid status')
    }
  });

  // Верификатор для чтения жанров
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
    },
    name: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'published', 'archived'])
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
        .oneOf(['name', 'popularity', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления жанров
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Genre ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}