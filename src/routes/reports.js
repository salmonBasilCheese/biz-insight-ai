import express from 'express';
import { Store, Sale, Review, Report } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { generateReport } from '../services/ai.js';
import { Op } from 'sequelize';

const router = express.Router();

// POST /api/v1/stores/:storeId/reports/generate - Generate AI report
router.post('/:storeId/reports/generate', authMiddleware, async (req, res) => {
    try {
        const { storeId } = req.params;
        const user_id = req.user.id;
        const { period_days = 7 } = req.body;

        // Verify store ownership
        const store = await Store.findOne({
            where: { id: storeId, user_id }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Get date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period_days);

        // Fetch sales data
        const salesData = await Sale.findAll({
            where: {
                store_id: storeId,
                date: {
                    [Op.gte]: startDate.toISOString().split('T')[0],
                    [Op.lte]: endDate.toISOString().split('T')[0]
                }
            },
            order: [['date', 'ASC']]
        });

        if (salesData.length === 0) {
            return res.status(400).json({
                error: 'No sales data available for the specified period'
            });
        }

        // Fetch recent reviews (optional)
        const reviewsData = await Review.findAll({
            where: { store_id: storeId },
            order: [['collected_at', 'DESC']],
            limit: 10
        });

        // Generate AI report
        const reportContent = await generateReport(
            {
                industry: store.industry,
                name: store.name
            },
            salesData.map(s => s.toJSON()),
            reviewsData.map(r => r.toJSON())
        );

        // Save report to database
        const report = await Report.create({
            store_id: storeId,
            period_start: startDate.toISOString().split('T')[0],
            period_end: endDate.toISOString().split('T')[0],
            content_json: reportContent
        });

        res.json({
            message: 'Report generated successfully',
            report: {
                id: report.id,
                period_start: report.period_start,
                period_end: report.period_end,
                content: reportContent,
                created_at: report.created_at
            }
        });

    } catch (error) {
        console.error('Report generation error:', error);

        if (error.message === 'Failed to generate AI report') {
            return res.status(503).json({
                error: 'AI service temporarily unavailable',
                details: 'Please check your OpenAI API key configuration'
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/stores/:storeId/reports - List all reports
router.get('/:storeId/reports', authMiddleware, async (req, res) => {
    try {
        const { storeId } = req.params;
        const user_id = req.user.id;

        // Verify store ownership
        const store = await Store.findOne({
            where: { id: storeId, user_id }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const reports = await Report.findAll({
            where: { store_id: storeId },
            order: [['created_at', 'DESC']],
            limit: 20
        });

        res.json({
            reports: reports.map(r => ({
                id: r.id,
                period_start: r.period_start,
                period_end: r.period_end,
                created_at: r.created_at
            }))
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/stores/:storeId/reports/:reportId - Get specific report
router.get('/:storeId/reports/:reportId', authMiddleware, async (req, res) => {
    try {
        const { storeId, reportId } = req.params;
        const user_id = req.user.id;

        // Verify store ownership
        const store = await Store.findOne({
            where: { id: storeId, user_id }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const report = await Report.findOne({
            where: { id: reportId, store_id: storeId }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({
            report: {
                id: report.id,
                period_start: report.period_start,
                period_end: report.period_end,
                content: report.content_json,
                created_at: report.created_at
            }
        });

    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/stores/:storeId/reports/:reportId/pdf - Download report PDF
router.get('/:storeId/reports/:reportId/pdf', authMiddleware, async (req, res) => {
    try {
        const { storeId, reportId } = req.params;
        const user_id = req.user.id;

        // Verify store ownership
        const store = await Store.findOne({
            where: { id: storeId, user_id }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const report = await Report.findOne({
            where: { id: reportId, store_id: storeId }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (!report.content_json) {
            return res.status(400).json({ error: 'Report content is empty' });
        }

        // Generate PDF
        const { generatePDF } = await import('../services/pdf.js');
        const pdfBuffer = await generatePDF(
            report.content_json,
            { name: store.name, industry: store.industry },
            `${report.period_start} to ${report.period_end}`
        );

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${report.period_end}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
