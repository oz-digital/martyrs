// @martyrs/src/modules/music/middlewares/artists.verifier.js
import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default function(db) {

  // Верификатор для создания артистов
  const createVerifier = new Verifier({
    name: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Artist name is required')
        .min(1, 'Name cannot be empty')
        .max(100, 'Name must not exceed 100 characters')
    },
    bio: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Bio must not exceed 2000 characters')
    },
    photoUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },

    coverUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    genre: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
        )
    },
    website: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^https?:\/\/.+/, 'Invalid website URL format')
    },
    location: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'Location must not exceed 100 characters')
    },
    owner: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    }
  });

  // Верификатор для обновления артистов
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Artist ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    },
    name: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name must not exceed 100 characters')
    },
    bio: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Bio must not exceed 2000 characters')
    },
    photoUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    coverUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    genre: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
        )
    },
    website: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^https?:\/\/.+/, 'Invalid website URL format')
    },
    location: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'Location must not exceed 100 characters')
    },
    isVerified: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'published', 'archived'], 'Invalid status')
    }
  });

  // Верификатор для чтения артистов
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    },
    genre: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
    },
    isVerified: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'published', 'archived'])
    },
    location: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
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

  // Верификатор для удаления артистов
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Artist ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}