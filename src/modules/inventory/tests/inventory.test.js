/**
 * Inventory Module Integration Tests
 * Tests for StockAdjustment, StockBalance, StockAvailability, and StockAudit
 * Uses real database data - no mocks
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';

// Import the main app
import app from '../../../app.js'; // Adjust path as needed

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  storage: null, // Will be set from real data
  product: null, // Will be set from real data
  variant: null, // Will be set from real data
  organization: null, // Will be set from real data
  user: null, // Will be set from real data
  authToken: null // Will be set from login
};

describe('Inventory Module Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    }

    // Get real test data from database
    const spotDoc = await mongoose.connection.db.collection('spots').findOne({});
    if (spotDoc) TEST_CONFIG.storage = spotDoc._id;

    const productDoc = await mongoose.connection.db.collection('products').findOne({});
    if (productDoc) TEST_CONFIG.product = productDoc._id;

    const variantDoc = await mongoose.connection.db.collection('variants').findOne({});
    if (variantDoc) TEST_CONFIG.variant = variantDoc._id;

    const orgDoc = await mongoose.connection.db.collection('organizations').findOne({});
    if (orgDoc) TEST_CONFIG.organization = orgDoc._id;

    const userDoc = await mongoose.connection.db.collection('users').findOne({});
    if (userDoc) TEST_CONFIG.user = userDoc._id;

    // TODO: Add authentication setup here if needed
    // TEST_CONFIG.authToken = await getAuthToken();
    
    console.log('Test configuration:', {
      storage: !!TEST_CONFIG.storage,
      product: !!TEST_CONFIG.product,
      variant: !!TEST_CONFIG.variant,
      organization: !!TEST_CONFIG.organization,
      user: !!TEST_CONFIG.user
    });
  }, TEST_CONFIG.timeout);

  describe('StockAdjustment API', () => {
    let createdAdjustmentId = null;

    test('POST /api/inventory/adjustments/create - Create stock adjustment', async () => {
      if (!TEST_CONFIG.product || !TEST_CONFIG.storage) {
        console.warn('Skipping test: Missing required test data');
        return;
      }

      const adjustmentData = {
        product: TEST_CONFIG.product,
        variant: TEST_CONFIG.variant,
        storage: TEST_CONFIG.storage,
        quantity: 10,
        reason: 'restock',
        comment: 'Test restock adjustment',
        owner: {
          type: 'organization',
          target: TEST_CONFIG.organization
        }
      };

      const response = await request(app)
        .post('/api/inventory/adjustments/create')
        .send(adjustmentData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.quantity).toBe(10);
      expect(response.body.reason).toBe('restock');
      
      createdAdjustmentId = response.body._id;
    });

    test('GET /api/inventory/adjustments - Read stock adjustments', async () => {
      const response = await request(app)
        .get('/api/inventory/adjustments')
        .query({ 
          limit: 10,
          ...(TEST_CONFIG.product && { product: TEST_CONFIG.product })
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('_id');
        expect(response.body[0]).toHaveProperty('quantity');
        expect(response.body[0]).toHaveProperty('reason');
      }
    });
  });

  describe('StockBalance API', () => {
    test('GET /api/inventory/balance - Read stock balances', async () => {
      const response = await request(app)
        .get('/api/inventory/balance')
        .query({ 
          limit: 10,
          ...(TEST_CONFIG.storage && { storage: TEST_CONFIG.storage })
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('quantity');
        expect(response.body[0]).toHaveProperty('product');
        expect(response.body[0]).toHaveProperty('storage');
      }
    });
  });

  describe('StockAvailability API', () => {
    test('GET /api/inventory/availability - Read stock availability', async () => {
      const response = await request(app)
        .get('/api/inventory/availability')
        .query({ 
          limit: 10,
          details: 'true',
          ...(TEST_CONFIG.storage && { storage: TEST_CONFIG.storage })
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('available');
        expect(response.body[0]).toHaveProperty('quantity');
        expect(response.body[0]).toHaveProperty('product');
      }
    });
  });

  describe('StockAudit API', () => {
    let createdInventoryId = null;

    test('POST /api/inventory/audits/create - Create inventory audit', async () => {
      if (!TEST_CONFIG.storage || !TEST_CONFIG.product) {
        console.warn('Skipping test: Missing required test data');
        return;
      }

      const inventoryData = {
        storage: TEST_CONFIG.storage,
        comment: 'Test inventory audit',
        positions: [{
          product: TEST_CONFIG.product,
          variant: TEST_CONFIG.variant,
          storage: TEST_CONFIG.storage,
          quantity: 5,
          reason: 'stocktake',
          comment: 'Test stocktake position'
        }],
        owner: {
          type: 'organization',
          target: TEST_CONFIG.organization
        }
      };

      const response = await request(app)
        .post('/api/inventory/audits/create')
        .send(inventoryData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe('draft');
      expect(response.body.storage.toString()).toBe(TEST_CONFIG.storage.toString());
      
      createdInventoryId = response.body._id;
    });

    test('GET /api/inventory/audits - Read inventory audits', async () => {
      const response = await request(app)
        .get('/api/inventory/audits')
        .query({ limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('_id');
        expect(response.body[0]).toHaveProperty('status');
        expect(response.body[0]).toHaveProperty('storage');
      }
    });

    test('POST /api/inventory/audits/complete - Complete inventory audit', async () => {
      if (!createdInventoryId) {
        console.warn('Skipping test: No inventory to complete');
        return;
      }

      const response = await request(app)
        .post('/api/inventory/audits/complete')
        .send({ _id: createdInventoryId })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe('completed');
    });
  });

  describe('Data Consistency Tests', () => {
    test('Adjustment creation updates balance and availability', async () => {
      if (!TEST_CONFIG.product || !TEST_CONFIG.storage) {
        console.warn('Skipping test: Missing required test data');
        return;
      }

      // Get initial balance
      const initialBalance = await request(app)
        .get('/api/inventory/balance')
        .query({ 
          product: TEST_CONFIG.product,
          storage: TEST_CONFIG.storage 
        });

      const initialQuantity = initialBalance.body[0]?.quantity || 0;

      // Create adjustment
      const adjustmentData = {
        product: TEST_CONFIG.product,
        variant: TEST_CONFIG.variant,
        storage: TEST_CONFIG.storage,
        quantity: 15,
        reason: 'restock',
        comment: 'Consistency test adjustment'
      };

      await request(app)
        .post('/api/inventory/adjustments/create')
        .send(adjustmentData)
        .expect(201);

      // Check updated balance
      const updatedBalance = await request(app)
        .get('/api/inventory/balance')
        .query({ 
          product: TEST_CONFIG.product,
          storage: TEST_CONFIG.storage 
        });

      const newQuantity = updatedBalance.body[0]?.quantity || 0;
      expect(newQuantity).toBe(initialQuantity + 15);

      // Check availability is recalculated
      const availability = await request(app)
        .get('/api/inventory/availability')
        .query({ 
          product: TEST_CONFIG.product,
          storage: TEST_CONFIG.storage 
        });

      expect(availability.body.length).toBeGreaterThan(0);
      expect(availability.body[0]).toHaveProperty('available');
    });
  });

  afterAll(async () => {
    // Cleanup test data if needed
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });
});