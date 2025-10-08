import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {

  // Верификатор для создания голосований
  const createVerifier = new Verifier({
    title: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Voting title is required')
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
    },
    description: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Description must not exceed 2000 characters')
    },
    type: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Voting type is required')
        .oneOf(['create_task', 'approve_task', 'create_initiative', 'update_milestone', 'general'], 'Invalid voting type')
    },
    targetModel: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['Task', 'Initiative', 'Milestone'], 'Invalid target model')
    },
    targetId: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid target ID format')
    },
    threshold: {
      rule: 'optional',
      default: 51,
      validator: Validator.schema()
        .number()
        .min(1, 'Threshold must be at least 1')
        .max(100, 'Threshold cannot exceed 100')
    },
    participants: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid participant ID format')
        )
    },
    result: {
      rule: 'optional',
      default: 'pending',
      validator: Validator.schema()
        .string()
        .oneOf(['pending', 'approved', 'rejected'], 'Invalid result')
    },
    initiative: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    },
    milestone: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format')
    },
    metadata: {
      rule: 'optional'
    },
    startDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    endDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    status: {
      rule: 'optional',
      default: 'pending',
      validator: Validator.schema()
        .string()
        .oneOf(['pending', 'active', 'closed'], 'Invalid status')
    }
  });

  // Верификатор для чтения голосований
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    },
    type: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['create_task', 'approve_task', 'create_initiative', 'update_milestone', 'general'], 'Invalid voting type')
    },
    initiative: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid initiative ID format')
    },
    milestone: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID format')
    },
    result: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['pending', 'approved', 'rejected'], 'Invalid result')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['pending', 'active', 'closed'], 'Invalid status')
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

  // Верификатор для обновления голосований
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Voting ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
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
    threshold: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
        .min(1, 'Threshold must be at least 1')
        .max(100, 'Threshold cannot exceed 100')
    },
    participants: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(
          Validator.schema()
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid participant ID format')
        )
    },
    result: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['pending', 'approved', 'rejected'], 'Invalid result')
    },
    metadata: {
      rule: 'optional'
    },
    endDate: {
      rule: 'optional',
      validator: Validator.schema()
        .date()
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['pending', 'active', 'closed'], 'Invalid status')
    }
  });

  // Верификатор для удаления голосований
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Voting ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}