import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default (function (db) {

  // Верификатор для создания
  const createVerifier = new Verifier({
    'contacts.name': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name must be at least 1 character')
        .max(255, 'Name must not exceed 255 characters')
    },
    'contacts.email': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters')
    },
    'contacts.phone': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format')
    },
    type: {
      rule: 'optional',
      default: 'newsletter',
      validator: Validator.schema()
        .string()
        .oneOf(['newsletter', 'support', 'inquiry', 'feedback', 'other'])
    },
    text: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Text must not exceed 2000 characters')
    },
    chat: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(255, 'Chat ID must not exceed 255 characters')
    },
    status: {
      rule: 'optional',
      default: 'created',
      validator: Validator.schema()
        .string()
        .oneOf(['created', 'in_progress', 'completed', 'cancelled'])
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization', 'User', 'Organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    }
  });

  // Верификатор для обновления
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Application ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
    },
    'contacts.name': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name must be at least 1 character')
        .max(255, 'Name must not exceed 255 characters')
    },
    'contacts.email': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters')
    },
    'contacts.phone': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format')
    },
    type: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['newsletter', 'support', 'inquiry', 'feedback', 'other'])
    },
    text: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Text must not exceed 2000 characters')
    },
    chat: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(255, 'Chat ID must not exceed 255 characters')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['created', 'in_progress', 'completed', 'cancelled'])
    }
  });

  // Верификатор для чтения
  const readVerifier = new Verifier({
    _id: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
    },
    owner: {
      rule: 'optional',
      validator: Validator.schema().string()
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['created', 'in_progress', 'completed', 'cancelled'])
    },
    type: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['newsletter', 'support', 'inquiry', 'feedback', 'other'])
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
        .oneOf(['contacts.name', 'contacts.email', 'type', 'status', 'createdAt', 'updatedAt'])
    },
    sortOrder: {
      rule: 'optional',
      default: 'desc',
      validator: Validator.schema()
        .string()
        .oneOf(['asc', 'desc'])
    }
  });

  // Верификатор для удаления
  const deleteVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Application ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/)
    }
  });

  return {
    createVerifier,
    readVerifier,
    updateVerifier,
    deleteVerifier
  };
});