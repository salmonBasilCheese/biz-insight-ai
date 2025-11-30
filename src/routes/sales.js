import express from 'express';
import multer from 'multer';
import { Sale } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { parse } from 'csv-parse/sync';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v1/stores/:storeId/sales/upload - Upload CSV
router.post('/:storeId/sales/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { storeId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Parse CSV
        const fileContent = req.file.buffer.toString();
        let records;

        try {
            records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        } catch (parseError) {
            return res.status(400).json({ error: 'Invalid CSV format', details: parseError.message });
        }

        if (records.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty' });
        }

        // Validate and transform records
        const salesData = [];
        const errors = [];

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const rowNum = i + 2; // +2 because: 1-indexed and header row

            // Try to auto-detect column names (flexible mapping)
            const date = record.date || record.Date || record.DATE || record['日付'];
            const revenue = record.revenue || record.Revenue || record.sales || record.Sales || record['売上'];
            const visitors = record.visitors || record.Visitors || record.customers || record.Customers || record['来客数'];
            const new_customers = record.new_customers || record.new || record.New || record['新規顧客'];

            if (!date) {
                errors.push(`Row ${rowNum}: Missing 'date' column`);
                continue;
            }

            salesData.push({
                store_id: storeId,
                date: date,
                revenue: parseInt(revenue) || 0,
                visitors: parseInt(visitors) || 0,
                new_customers: parseInt(new_customers) || 0,
                notes: record.notes || record.Notes || null
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation errors',
                errors: errors.slice(0, 10), // Limit to first 10 errors
                total_errors: errors.length
            });
        }

        // Bulk insert
        await Sale.bulkCreate(salesData, {
            updateOnDuplicate: ['revenue', 'visitors', 'new_customers', 'notes']
        });

        res.json({
            message: 'CSV uploaded successfully',
            records_imported: salesData.length
        });

    } catch (error) {
        console.error('CSV upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/stores/:storeId/sales - Get sales data
router.get('/:storeId/sales', authMiddleware, async (req, res) => {
    try {
        const { storeId } = req.params;
        const { start_date, end_date, limit = 100 } = req.query;

        const where = { store_id: storeId };

        if (start_date && end_date) {
            where.date = {
                [Op.gte]: start_date,
                [Op.lte]: end_date
            };
        }

        const sales = await Sale.findAll({
            where,
            order: [['date', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ sales });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
