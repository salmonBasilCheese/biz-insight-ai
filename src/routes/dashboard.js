import express from 'express';
import { Sale, Store } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/v1/stores/:storeId/dashboard - Get dashboard data
router.get('/:storeId/dashboard', authMiddleware, async (req, res) => {
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

        // Get date ranges
        const today = new Date();
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);

        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

        // This week's data
        const thisWeekSales = await Sale.findAll({
            where: {
                store_id: storeId,
                date: { [Op.gte]: thisWeekStart.toISOString().split('T')[0] }
            }
        });

        // Last week's data
        const lastWeekSales = await Sale.findAll({
            where: {
                store_id: storeId,
                date: {
                    [Op.gte]: lastWeekStart.toISOString().split('T')[0],
                    [Op.lte]: lastWeekEnd.toISOString().split('T')[0]
                }
            }
        });

        // Calculate aggregates
        const calculateMetrics = (sales) => {
            const totalRevenue = sales.reduce((sum, s) => sum + (s.revenue || 0), 0);
            const totalVisitors = sales.reduce((sum, s) => sum + (s.visitors || 0), 0);
            const totalNewCustomers = sales.reduce((sum, s) => sum + (s.new_customers || 0), 0);
            const avgCustomerValue = totalVisitors > 0 ? totalRevenue / totalVisitors : 0;

            return {
                total_revenue: totalRevenue,
                total_visitors: totalVisitors,
                total_new_customers: totalNewCustomers,
                avg_customer_value: Math.round(avgCustomerValue),
                days_count: sales.length
            };
        };

        const thisWeek = calculateMetrics(thisWeekSales);
        const lastWeek = calculateMetrics(lastWeekSales);

        // Calculate changes
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const dashboard = {
            store: {
                id: store.id,
                name: store.name,
                industry: store.industry
            },
            period: {
                this_week_start: thisWeekStart.toISOString().split('T')[0],
                last_week_start: lastWeekStart.toISOString().split('T')[0],
                last_week_end: lastWeekEnd.toISOString().split('T')[0]
            },
            metrics: {
                revenue: {
                    current: thisWeek.total_revenue,
                    previous: lastWeek.total_revenue,
                    change_percent: calculateChange(thisWeek.total_revenue, lastWeek.total_revenue)
                },
                visitors: {
                    current: thisWeek.total_visitors,
                    previous: lastWeek.total_visitors,
                    change_percent: calculateChange(thisWeek.total_visitors, lastWeek.total_visitors)
                },
                avg_customer_value: {
                    current: thisWeek.avg_customer_value,
                    previous: lastWeek.avg_customer_value,
                    change_percent: calculateChange(thisWeek.avg_customer_value, lastWeek.avg_customer_value)
                },
                new_customers: {
                    current: thisWeek.total_new_customers,
                    previous: lastWeek.total_new_customers,
                    change_percent: calculateChange(thisWeek.total_new_customers, lastWeek.total_new_customers)
                }
            },
            daily_breakdown: thisWeekSales.map(sale => ({
                date: sale.date,
                revenue: sale.revenue,
                visitors: sale.visitors,
                new_customers: sale.new_customers
            }))
        };

        res.json(dashboard);

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
