import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания задач
  const createVerifier = new Verifier({
    title: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Task title is required')
        .min(1, 'Title cannot be empty')
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
      default: 'not_started',
      validator: Validator.schema()
        .string()
        .oneOf(['proposed', 'voting', 'not_started', 'in_progress', 'review', 'completed', 'blocked', 'cancelled'], 'Invalid status')
    },
    assignedTo: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    },
    dueDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    milestone: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format')
    },
    initiative: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    },
    priority: {
      rule: 'optional',
      default: 'medium',
      validator: Validator.schema()
        .string()
        .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority')
    },
    tags: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(Validator.schema().string())
    },
    proposedByVoting: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    },
    completionVoting: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    },
    completedDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    }
  });

  // Верификатор для чтения задач
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
    },
    milestone: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format')
    },
    initiative: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    },
    assignedTo: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['proposed', 'voting', 'not_started', 'in_progress', 'review', 'completed', 'blocked', 'cancelled'], 'Invalid status')
    },
    priority: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority')
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

  // Верификатор для обновления задач
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Task ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
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
        .max(2000, 'Description must not exceed 2000 characters')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['proposed', 'voting', 'not_started', 'in_progress', 'review', 'completed', 'blocked', 'cancelled'], 'Invalid status')
    },
    assignedTo: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    },
    dueDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    priority: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority')
    },
    tags: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(Validator.schema().string())
    },
    completionVoting: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    },
    completedDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    }
  });

  // Верификатор для удаления задач
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Task ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}