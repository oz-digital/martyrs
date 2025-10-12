import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default function(db) {

  // Верификатор для создания голосов
  const createVerifier = new Verifier({
    voting: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Voting ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    },
    value: {
      rule: 'required',
      validator: Validator.schema()
        .number()
        .required('Vote value is required')
    },
    voter: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voter ID format')
    },
    comment: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(500, 'Comment must not exceed 500 characters')
    }
  });

  // Верификатор для чтения голосов
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid vote ID format')
    },
    voting: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voting ID format')
    },
    voter: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid voter ID format')
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

  // Верификатор для обновления голосов
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Vote ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid vote ID format')
    },
    value: {
      rule: 'optional',
      validator: Validator.schema()
        .number()
    },
    comment: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(500, 'Comment must not exceed 500 characters')
    }
  });

  // Верификатор для удаления голосов
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Vote ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid vote ID format')
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
}