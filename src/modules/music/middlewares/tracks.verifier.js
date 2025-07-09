// @martyrs/src/modules/music/middlewares/tracks.verifier.js
import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания треков
  const createVerifier = new Verifier({
    title: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Track title is required')
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
    },
    artist: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Artist is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    },
    album: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid album ID format')
    },
    fileUrl: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('File URL is required')
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    coverUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    duration: {
      rule: 'optional',
      default: 0,
      validator: Validator.schema()
        .number()
        .min(0, 'Duration cannot be negative')
        .max(3600, 'Duration cannot exceed 1 hour')
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
    releaseDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    isExplicit: {
      rule: 'optional',
      default: false,
      validator: Validator.schema()
        .boolean()
    },
    lyrics: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(10000, 'Lyrics too long')
    },
    isPublic: {
      rule: 'optional',
      default: true,
      validator: Validator.schema()
        .boolean()
    },
    owner: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    }
  });

  // Верификатор для обновления треков
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Track ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid track ID format')
    },
    title: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
    },
    artist: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    },
    album: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid album ID format')
    },
    fileUrl: {
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
    // duration: {
    //   rule: 'optional',
    //   validator: Validator.schema()
    //     .number()
    //     .min(0, 'Duration cannot be negative')
    //     .max(3600, 'Duration cannot exceed 1 hour')
    // },
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
    releaseDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    isExplicit: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    },
    lyrics: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(10000, 'Lyrics too long')
    },
    isPublic: {
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

  // Верификатор для чтения треков
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid track ID format')
    },
    artist: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid artist ID format')
    },
    album: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid album ID format')
    },
    genre: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid genre ID format')
    },
    isPublic: {
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
        .oneOf(['title', 'playCount', 'releaseDate', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления треков
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Track ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid track ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}