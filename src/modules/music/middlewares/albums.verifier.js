// @martyrs/src/modules/music/middlewares/albums.verifier.js
import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания альбомов
  const createVerifier = new Verifier({
    title: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Album title is required')
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    releaseDate: {
      rule: 'required',
      validator: Validator.schema()
        .date()
        .required('Release date is required')
    },
    coverArt: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    artists: {
      rule: 'required',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
        )
        .min(1, 'At least one artist is required')
    },
    type: {
      rule: 'optional',
      default: 'album',
      validator: Validator.schema()
        .string()
        .oneOf(['album', 'single', 'EP', 'compilation'], 'Invalid album type')
    },
    genres: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
        )
    },
    totalTracks: {
      rule: 'optional',
      default: 0,
      validator: Validator.schema()
        .integer()
        .min(0, 'Total tracks cannot be negative')
        .max(100, 'Too many tracks')
    },
    owner: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    }
  });

  // Верификатор для обновления альбомов
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Album ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid album ID format')
    },
    title: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    releaseDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    coverArt: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    artists: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
        )
        .min(1, 'At least one artist is required')
    },
    type: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['album', 'single', 'EP', 'compilation'], 'Invalid album type')
    },
    genres: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
        )
    },
    totalTracks: {
      rule: 'optional',
      validator: Validator.schema()
        .integer()
        .min(0, 'Total tracks cannot be negative')
        .max(100, 'Too many tracks')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'published', 'archived'], 'Invalid status')
    }
  });

  // Верификатор для чтения альбомов
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid album ID format')
    },
    artists: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    },
    type: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['album', 'single', 'EP', 'compilation'])
    },
    genres: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
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
        .oneOf(['title', 'releaseDate', 'totalTracks', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления альбомов
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Album ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid album ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}