// @martyrs/src/modules/music/middlewares/playlists.verifier.js
import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания плейлистов
  const createVerifier = new Verifier({
    title: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Playlist title is required')
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    coverUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\/(?!\/)/, 'Only relative URLs starting with "/" are allowed'),
    },
    tracks: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema().object({
            track: Validator.schema()
              .string()
              .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid track ID format')
              .required(),
            addedAt: Validator.schema().date()          })
        )
    },
    isPublic: {
      rule: 'optional',
      default: true,
      validator: Validator.schema()
        .boolean()
    },
    isCollaborative: {
      rule: 'optional',
      default: false,
      validator: Validator.schema()
        .boolean()
    },
    collaborators: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid collaborator ID format')
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

  // Верификатор для обновления плейлистов
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Playlist ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid playlist ID format')
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
    coverUrl: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^https?:\/\/.+/, 'Invalid cover URL format')
    },
    tracks: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema().object({
            track: Validator.schema()
              .string()
              .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid track ID format')
              .required(),
            addedAt: Validator.schema().date()          })
        )
    },
    isPublic: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    },
    isCollaborative: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    },
    collaborators: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid collaborator ID format')
        )
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['draft', 'published', 'archived'], 'Invalid status')
    }
  });

  // Верификатор для чтения плейлистов
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid playlist ID format')
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid owner ID format')
    },
    isPublic: {
      rule: 'optional',
      validator: Validator.schema()
        .boolean()
    },
    isCollaborative: {
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
        .oneOf(['title', 'followers', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления плейлистов
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Playlist ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid playlist ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}