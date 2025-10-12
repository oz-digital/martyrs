import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default (function (db) {

  // Верификатор для создания
  const createVerifier = new Verifier({
    email: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters')
    },
    phone: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format')
    },
    'profile.name': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name must be at least 1 character')
        .max(255, 'Name must not exceed 255 characters')
    },
    'profile.description': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    'profile.photo': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(500, 'Photo URL must not exceed 500 characters')
    },
    source: {
      rule: 'optional',
      default: 'web',
      validator: Validator.schema()
        .string()
        .oneOf(['web', 'mobile', 'api', 'import', 'manual', 'referral', 'social', 'email'])
    },
    'referral.code': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(50, 'Referral code must not exceed 50 characters')
    },
    'referral.source': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid referral source ID format')
    },
    tags: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(Validator.schema().string().max(50))
        .max(20, 'Cannot have more than 20 tags')
    },
    notes: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Notes must not exceed 2000 characters')
    },
    status: {
      rule: 'optional',
      default: 'active',
      validator: Validator.schema()
        .string()
        .oneOf(['active', 'inactive', 'blocked'])
    },
    'identity.type': {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .oneOf(['Visitor', 'User', 'Organization'])
    },
    'identity.target': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid identity target ID format')
    },
    owner: {
      rule: 'required',
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['user', 'organization', 'User', 'Organization']),
        target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
      })
    },
    'address.country': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'Country must not exceed 100 characters')
    },
    'address.addressLine1': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(255, 'Address line 1 must not exceed 255 characters')
    },
    'address.addressLine2': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(255, 'Address line 2 must not exceed 255 characters')
    },
    'address.city': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'City must not exceed 100 characters')
    },
    'address.postalCode': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(20, 'Postal code must not exceed 20 characters')
    }
  });

  // Верификатор для обновления
  const updateVerifier = new Verifier({
    _id: {
      rule: 'required',
      validator: Validator.schema()
        .string()
        .required('Customer ID is required')
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
    },
    email: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters')
    },
    phone: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format')
    },
    'profile.name': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .min(1, 'Name must be at least 1 character')
        .max(255, 'Name must not exceed 255 characters')
    },
    'profile.description': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
    },
    'profile.photo': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(500, 'Photo URL must not exceed 500 characters')
    },
    source: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['web', 'mobile', 'api', 'import', 'manual', 'referral', 'social', 'email'])
    },
    'referral.code': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(50, 'Referral code must not exceed 50 characters')
    },
    'referral.source': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid referral source ID format')
    },
    tags: {
      rule: 'optional',
      validator: Validator.schema()
        .array()
        .items(Validator.schema().string().max(50))
        .max(20, 'Cannot have more than 20 tags')
    },
    notes: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(2000, 'Notes must not exceed 2000 characters')
    },
    status: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['active', 'inactive', 'blocked'])
    },
    'address.country': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'Country must not exceed 100 characters')
    },
    'address.addressLine1': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(255, 'Address line 1 must not exceed 255 characters')
    },
    'address.addressLine2': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(255, 'Address line 2 must not exceed 255 characters')
    },
    'address.city': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(100, 'City must not exceed 100 characters')
    },
    'address.postalCode': {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .max(20, 'Postal code must not exceed 20 characters')
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
        .oneOf(['active', 'inactive', 'blocked'])
    },
    source: {
      rule: 'optional',
      validator: Validator.schema()
        .string()
        .oneOf(['web', 'mobile', 'api', 'import', 'manual', 'referral', 'social', 'email'])
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
        .oneOf(['profile.name', 'email', 'phone', 'lastActivity', 'createdAt', 'updatedAt'])
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
        .required('Customer ID is required')
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