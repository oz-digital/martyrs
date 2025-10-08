import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания майлстоунов
  const createVerifier = new Verifier({
    name: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Milestone name is required')
        .min(1, 'Name cannot be empty')
        .max(200, 'Name must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    status: {
      rule: 'optional',
      default: 'not_started',
      validator: Validator.schema()
        .string()
        .oneOf(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'], 'Invalid status')
    },
    startDate: {
      rule: 'required',
      validator: Validator.schema()
        .date()
        .required('Start date is required')
    },
    dueDate: {
      rule: 'required',
      validator: Validator.schema()
        .date()
        .required('Due date is required')
    },
    completedDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    progress: {
      rule: 'optional',
      default: 0,
      validator: Validator.schema()
        .number()
        .min(0, 'Progress cannot be negative')
        .max(100, 'Progress cannot exceed 100')
    },
    owner: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Owner is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid owner ID format')
    },
    contributors: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid contributor ID format')
        )
    },
    initiative: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Initiative is required')
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
    dependencies: {
      rule: 'optional'
    },
    metadata: {
      rule: 'optional'
    }
  });

  // Верификатор для чтения майлстоунов
  const readVerifier = new Verifier({
    _id: {
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
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'], 'Invalid status')
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid owner ID format')
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

  // Верификатор для обновления майлстоунов
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Milestone ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format')
    },
    name: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name cannot be empty')
        .max(200, 'Name must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'], 'Invalid status')
    },
    startDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    dueDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    completedDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    progress: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
        .min(0, 'Progress cannot be negative')
        .max(100, 'Progress cannot exceed 100')
    },
    contributors: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid contributor ID format')
        )
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
    dependencies: {
      rule: 'optional'
    },
    metadata: {
      rule: 'optional'
    }
  });

  // Верификатор для удаления майлстоунов
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Milestone ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}