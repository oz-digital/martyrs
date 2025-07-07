# Inventory Module Documentation

## Overview
Inventory module provides comprehensive stock management functionality including inventory audits, stock adjustments, balance tracking, and availability calculations.

## Architecture

### Models

#### 1. StockInventory
**Purpose**: Mass inventory audit/stocktake sessions
**Schema**:
```javascript
{
  storage: ObjectId(Spot),     // Storage location
  status: 'draft' | 'completed' | 'cancelled',
  positions: [ObjectId(StockAdjustment)],  // Related adjustments
  comment: String,             // Audit notes
  owner: OwnershipSchema,      // Organization/User
  creator: OwnershipSchema,    // Who created
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. StockAdjustment
**Purpose**: Individual stock movements/corrections
**Schema**:
```javascript
{
  product: ObjectId(Product),   // Product reference
  variant: ObjectId(Variant),   // Variant reference
  storage: ObjectId(Spot),      // Storage location
  source: {                     // Movement source
    type: 'User' | 'Order' | 'Inventory',
    target: ObjectId
  },
  reason: 'restock' | 'sale' | 'return' | 'damage' | 'transfer' | 'custom',
  comment: String,              // Adjustment notes
  quantity: Number,             // Can be positive or negative
  cost: Number,                 // Cost per unit
  owner: OwnershipSchema,
  creator: OwnershipSchema,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. StockBalance
**Purpose**: Current stock levels per product/variant/storage
**Schema**:
```javascript
{
  product: ObjectId(Product),
  variant: ObjectId(Variant),
  storage: ObjectId(Spot),
  quantity: Number,             // Current stock level
  owner: OwnershipSchema,
  creator: OwnershipSchema,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. StockAvailability
**Purpose**: Calculated availability including ingredient constraints
**Schema**:
```javascript
{
  product: ObjectId(Product),
  variant: ObjectId(Variant),
  storage: ObjectId(Spot),
  quantity: Number,             // Direct stock
  available: Number,            // Available considering ingredients
  constraints: [{               // Ingredient limitations
    ingredient: ObjectId,
    stock: Number,
    required: Number,
    available: Number
  }],
  calculatedAt: Date,
  owner: OwnershipSchema,
  creator: OwnershipSchema
}
```

#### 5. StockAlert
**Purpose**: Stock level alerts and notifications
**Schema**:
```javascript
{
  product: ObjectId(Product),   // Product to monitor
  variant: ObjectId(Variant),   // Specific variant (null = all variants)
  storage: ObjectId(Spot),      // Specific storage (null = all storages)
  threshold: Number,            // Alert threshold quantity
  enabled: Boolean,             // Alert active status
  owner: OwnershipSchema,       // Organization
  creator: OwnershipSchema,     // User who created alert
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### StockAdjustment
- `GET /api/inventory/adjustments` - List adjustments with filters
- `POST /api/inventory/adjustments/create` - Create single adjustment

#### StockBalance
- `GET /api/inventory/balance` - Get current stock balances

#### StockAvailability
- `GET /api/inventory/availability` - Get availability with ingredient constraints

#### StockAudit (renamed from StockInventory)
- `GET /api/inventory/audits` - List inventory audits
- `POST /api/inventory/audits/create` - Create inventory audit (draft/published)
- `POST /api/inventory/audits/complete` - Complete inventory audit

#### StockAlert
- `GET /api/inventory/alerts` - List stock alerts with filters
- `POST /api/inventory/alerts` - Create stock alert
- `PUT /api/inventory/alerts` - Update stock alert
- `DELETE /api/inventory/alerts` - Delete stock alert

### Business Logic

#### Availability Calculation
The system automatically calculates availability based on:
1. **Direct stock** - quantity in StockBalance
2. **Ingredient constraints** - for variants with ingredients
3. **On-demand support** - unlimited if no required ingredients

#### Inventory Audit Workflow
1. **Create Draft** - StockAudit in 'draft' status with positions as data
2. **Publish** - Either publish directly or complete draft to apply changes
3. **Auto-processing** - Creates StockAdjustments, updates balances, recalculates availability

#### Stock Alert System
1. **Create Alert** - Define product/variant/storage scope and threshold
2. **Automatic Monitoring** - Alerts checked during availability recalculation
3. **Notification Delivery** - Notifications sent via API when threshold breached
4. **Flexible Scope** - Monitor entire product, specific variants, or storage locations

#### Automatic Recalculation
- Triggered on every StockAdjustment creation
- Updates StockBalance via $inc operations
- Recalculates StockAvailability for affected variants
- Handles ingredient dependencies
- Checks stock alerts and sends notifications when thresholds breached

### Data Types

#### Reason Types
- `restock` - Incoming stock
- `sale` - Stock sold
- `return` - Returned items
- `damage` - Damaged goods
- `transfer` - Location transfer
- `custom` - Custom reason

#### Status Types
- `draft` - Audit in progress
- `published` - Audit completed and applied
- `cancelled` - Audit cancelled

### Frontend Integration

#### Components Structure
```
inventory/
├── components/
│   ├── forms/
│   │   ├── AdjustmentForm.vue     # Single adjustment creation
│   │   ├── HistoryView.vue        # Adjustment history
│   │   ├── ColumnSettingsMenu.vue # Table settings
│   │   └── StockAlertsForm.vue    # Stock alert configuration
│   ├── pages/
│   │   ├── InventoryEdit.vue      # Mass inventory audit
│   │   └── Inventory.vue          # Main inventory view
│   └── blocks/
│       └── ... (shared components)
├── store/
│   ├── inventory.store.js         # Legacy inventory store
│   └── stock.alerts.store.js      # Stock alerts store
├── services/
│   ├── inventory.crud.js          # CRUD operations
│   └── inventory.verifier.js      # Request validation
└── routes/
    ├── inventory.routes.js         # Main API routes
    └── stock.alerts.routes.js      # Stock alerts routes
```

#### API Integration
- **Mass Inventory**: Use StockInventory endpoints
- **Point Adjustments**: Use StockAdjustment endpoints directly
- **Display Data**: Use StockAvailability for current state

#### Module Initialization
The inventory module is initialized through `inventory.client.js`:
```javascript
export default {
  initialize: initializeInventory
};
```

#### Routing Configuration
The module uses dynamic route registration with context-aware routing:
- **Backoffice Context**: `/inventory` - Global inventory management
- **Organization Context**: `/organizations/:_id/inventory` - Org-specific inventory

#### Navigation Integration
- Replaces legacy "Leftovers" navigation with "Inventory"
- Supports both backoffice and organization contexts
- Properly handles route parameters and authentication

### Performance Considerations

#### Caching
- 5-minute TTL for read operations
- Tag-based invalidation
- Fire-and-forget cache clearing

#### Bulk Operations
- Bulk balance updates during inventory completion
- Batch availability recalculation
- Optimized aggregation pipelines

#### Change Streams
- Real-time ingredient recipe updates
- Automatic availability recalculation
- Observer pattern for notifications

### Migration from Leftovers

#### Architecture Changes
- **From**: Simple leftovers model with basic tracking
- **To**: Comprehensive inventory system with:
  - Structured stock adjustments
  - Automated balance tracking
  - Availability calculations with ingredient constraints
  - Audit trail capabilities

#### Component Migration
- `products/components/pages/LeftoverEdit.vue` → `inventory/components/pages/InventoryEdit.vue`
- `products/components/pages/Leftovers.vue` → `inventory/components/pages/Inventory.vue`
- Updated to use inventory API endpoints and models
- Enhanced with context-aware routing

#### API Migration
- Legacy leftovers endpoints deprecated
- New inventory endpoints provide enhanced functionality
- Proper request validation through verifiers
- ABAC integration for access control

#### Data Format Changes
- **Quantity**: Remains as `number` (not integer) for decimal support
- **Structure**: Enhanced with source tracking, reason categorization
- **Relationships**: Proper references to products, variants, and storage locations

### Request Validation

#### Verifier Implementation
The inventory module uses comprehensive request validation:
- **Type Conversion**: Automatic string-to-number conversion for skip/limit parameters
- **Validation Rules**: Joi-based schema validation with custom rules
- **Error Handling**: Proper error responses with validation details

#### Common Validation Patterns
- ObjectId validation for references
- Numeric range validation for quantities and pagination
- Enum validation for reason types and statuses
- Required field validation with custom error messages

### Testing Strategy

#### Unit Tests
- Model validation
- Business logic functions
- API endpoint responses

#### Integration Tests
- Full inventory workflow
- Availability calculation accuracy
- Balance consistency

#### Performance Tests
- Bulk operations
- Large dataset handling
- Concurrent access patterns