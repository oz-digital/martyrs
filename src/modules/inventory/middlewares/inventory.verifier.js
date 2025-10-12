import Validator from '@martyrs/src/modules/core/controllers/classes/core.validator.js';
import Verifier from '@martyrs/src/modules/core/controllers/classes/core.verifier.js';

export default function(db) {
  // Stock Adjustment verifiers
  const adjustmentQueryConfig = {
    product: { rule: 'optional', validator: Validator.schema().string() },
    variant: { rule: 'optional', validator: Validator.schema().string() },
    storage: { rule: 'optional', validator: Validator.schema().string() },
    reason: { rule: 'optional', validator: Validator.schema().string() },
    dateStart: { rule: 'optional', validator: Validator.schema().date() },
    dateEnd: { rule: 'optional', validator: Validator.schema().date() },
    skip: { rule: 'optional', validator: Validator.schema().integer().min(0), default: 0 },
    limit: { rule: 'optional', validator: Validator.schema().integer().min(1).max(100), default: 20 }
  };
  
  const adjustmentBodyConfig = {
    product: { rule: 'required', validator: Validator.schema().string() },
    variant: { rule: 'optional', validator: Validator.schema().string() },
    storage: { rule: 'required', validator: Validator.schema().string() },
    source: { 
      rule: 'required', 
      validator: Validator.schema().object({
        type: Validator.schema().string().oneOf(['User', 'Order', 'Inventory']).required(),
        target: Validator.schema().string().required()
      })
    },
    reason: { 
      rule: 'required', 
      validator: Validator.schema().string().oneOf(['restock', 'sale', 'return', 'damage', 'transfer', 'custom'])
    },
    quantity: { rule: 'required', validator: Validator.schema().integer() },
    cost: { rule: 'optional', validator: Validator.schema().number().min(0) },
    comment: { rule: 'optional', validator: Validator.schema().string() }
  };
  
  // Availability & Inventory query verifiers
  const queryConfig = {
    product: { rule: 'optional', validator: Validator.schema().string() },
    storage: { rule: 'optional', validator: Validator.schema().string() },
    skip: { rule: 'optional', validator: Validator.schema().integer().min(0), default: 0 },
    limit: { rule: 'optional', validator: Validator.schema().integer().min(1).max(100), default: 50 },
    details: { rule: 'optional', validator: Validator.schema().string() },
    search: { rule: 'optional', validator: Validator.schema().string() },
    sortParam: { rule: 'optional', validator: Validator.schema().string() },
    sortOrder: { rule: 'optional', validator: Validator.schema().string().oneOf(['asc', 'desc']) }
  };
  
  // Inventory verifiers
  const inventoryBodyConfig = {
    storage: { rule: 'required', validator: Validator.schema().string() },
    comment: { rule: 'optional', validator: Validator.schema().string() },
    status: { rule: 'optional', validator: Validator.schema().string().oneOf(['draft', 'published']), default: 'draft' },
    positions: { 
      rule: 'required', 
      validator: Validator.schema().array().items(
        Validator.schema().object({
          product: Validator.schema().string().required(),
          variant: Validator.schema().string(),
          quantity: Validator.schema().number().integer().required()
        })
      )
    }
  };
  
  const adjustmentQueryVerifier = new Verifier(adjustmentQueryConfig);
  const adjustmentBodyVerifier = new Verifier(adjustmentBodyConfig);
  const queryVerifier = new Verifier(queryConfig);
  const inventoryBodyVerifier = new Verifier(inventoryBodyConfig);
  
  return {
    verifyAdjustmentQuery: (req, res, next) => {
      const verification = adjustmentQueryVerifier.verify(req.query);
      if (!verification.isValid) {
        return res.status(400).json({ errors: verification.verificationErrors });
      }
      req.verifiedQuery = verification.verifiedData;
      next();
    },
    verifyAdjustmentBody: (req, res, next) => {
      const verification = adjustmentBodyVerifier.verify(req.body);
      if (!verification.isValid) {
        return res.status(400).json({ errors: verification.verificationErrors });
      }
      req.verifiedBody = verification.verifiedData;
      next();
    },
    verifyAvailabilityQuery: (req, res, next) => {
      const verification = queryVerifier.verify(req.query);
      if (!verification.isValid) {
        return res.status(400).json({ errors: verification.verificationErrors });
      }
      // Преобразуем числовые поля
      verification.verifiedData.skip = parseInt(verification.verifiedData.skip) || 0;
      verification.verifiedData.limit = parseInt(verification.verifiedData.limit) || 50;
      req.verifiedQuery = verification.verifiedData;
      next();
    },
    verifyInventoryQuery: (req, res, next) => {
      const verification = queryVerifier.verify(req.query);
      if (!verification.isValid) {
        return res.status(400).json({ errors: verification.verificationErrors });
      }
      // Преобразуем числовые поля
      verification.verifiedData.skip = parseInt(verification.verifiedData.skip) || 0;
      verification.verifiedData.limit = parseInt(verification.verifiedData.limit) || 50;
      req.verifiedQuery = verification.verifiedData;
      next();
    },
    verifyInventoryBody: (req, res, next) => {
      const verification = inventoryBodyVerifier.verify(req.body);
      if (!verification.isValid) {
        return res.status(400).json({ errors: verification.verificationErrors });
      }
      req.verifiedBody = verification.verifiedData;
      next();
    },
    verifyInventoryComplete: (req, res, next) => {
      if (!req.body._id) {
        return res.status(400).json({ message: 'Inventory ID required' });
      }
      req.verifiedBody = { _id: req.body._id };
      next();
    }
  };
}