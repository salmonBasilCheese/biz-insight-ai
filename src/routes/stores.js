import express from 'express';
import { Store } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /api/v1/stores - Create a new store
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, industry, google_place_id, address } = req.body;
        const user_id = req.user.id;

        // Validation
        if (!name || !industry) {
            return res.status(400).json({ error: 'Name and industry are required' });
        }

        const validIndustries = ['restaurant', 'clinic', 'salon', 'real_estate'];
        if (!validIndustries.includes(industry)) {
            return res.status(400).json({
                error: 'Invalid industry. Must be one of: ' + validIndustries.join(', ')
            });
        }

        // Create store
        const store = await Store.create({
            user_id,
            name,
            industry,
            google_place_id,
            address
        });

        res.status(201).json({
            message: 'Store created successfully',
            store: {
                id: store.id,
                name: store.name,
                industry: store.industry,
                google_place_id: store.google_place_id,
                address: store.address
            }
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/stores - Get all stores for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.id;

        const stores = await Store.findAll({
            where: { user_id },
            attributes: ['id', 'name', 'industry', 'google_place_id', 'address', 'created_at']
        });

        res.json({ stores });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/stores/:id - Get a specific store
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const store = await Store.findOne({
            where: { id, user_id }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json({ store });
    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/v1/stores/:id - Update a store
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { name, industry, google_place_id, address } = req.body;

        const store = await Store.findOne({
            where: { id, user_id }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Update fields
        if (name) store.name = name;
        if (industry) store.industry = industry;
        if (google_place_id !== undefined) store.google_place_id = google_place_id;
        if (address !== undefined) store.address = address;

        await store.save();

        res.json({
            message: 'Store updated successfully',
            store
        });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
