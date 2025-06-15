import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default function(db) {
  // Stock Adjustment verifiers
  const adjustmentQueryConfig = {
    product: { rule: 'optional', validator: Validator.schema().string() },
    variant: { rule: 'optional', validator: Validator.schema().string() },
    storage: { rule: 'optional', validator: Validator.schema().string() },
    reason: { rule: 'optional', validator: Validator.schema().string() },
    dateStart: { rule: 'optional', validator: Validator.schema().date() },
    dateEnd: { rule: 'optional', validator: Validator.schema().date() },
    skip: { rule: 'optional', validator: Validator.schema().number().min(0), default: 0 },
    limit: { rule: 'optional', validator: Validator.schema().number().min(1).max(100), default: 20 }
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
    quantity: { rule: 'required', validator: Validator.schema().number().integer() },
    cost: { rule: 'optional', validator: Validator.schema().number().min(0) },
    comment: { rule: 'optional', validator: Validator.schema().string() }
  };
  
  // Balance & Availability verifiers
  const balanceQueryConfig = {
    product: { rule: 'optional', validator: Validator.schema().string() },
    storage: { rule: 'optional', validator: Validator.schema().string() },
    skip: { rule: 'optional', validator: Validator.schema().number().min(0), default: 0 },
    limit: { rule: 'optional', validator: Validator.schema().number().min(1).max(100), default: 50 }
  };
  
  // Inventory verifiers
  const inventoryBodyConfig = {
    storage: { rule: 'required', validator: Validator.schema().string() },
    comment: { rule: 'optional', validator: Validator.schema().string() },
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
  const balanceQueryVerifier = new Verifier(balanceQueryConfig);
  const inventoryBodyVerifier = new Verifier(inventoryBodyConfig);
  
  return {
    verifyAdjustmentQuery: adjustmentQueryVerifier.middleware(),
    verifyAdjustmentBody: adjustmentBodyVerifier.middleware(),
    verifyBalanceQuery: balanceQueryVerifier.middleware(),
    verifyAvailabilityQuery: balanceQueryVerifier.middleware(),
    verifyInventoryQuery: balanceQueryVerifier.middleware(),
    verifyInventoryBody: inventoryBodyVerifier.middleware(),
    verifyInventoryComplete: (req, res, next) => {
      if (!req.body._id) {
        return res.status(400).json({ message: 'Inventory ID required' });
      }
      req.verifiedBody = { _id: req.body._id };
      next();
    }
  };
}