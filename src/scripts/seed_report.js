import { Report, Store, User } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
    try {
        // Find a store
        const store = await Store.findOne();
        if (!store) {
            console.error('No store found. Please create a store first.');
            process.exit(1);
        }

        const dummyContent = {
            summary: "This is a test report summary generated for verification.",
            kpi_analysis: ["Revenue is up 10%", "Visitors increased by 5%", "Customer retention is stable"],
            issues: ["Staff shortage on weekends", "Inventory management delay"],
            actions: ["Hire part-time staff", "Implement new inventory system"],
            forecast: {
                revenue: 500000,
                visitors: 150,
                reasoning: "Based on holiday season trends"
            }
        };

        const report = await Report.create({
            id: uuidv4(),
            store_id: store.id,
            period_start: '2023-11-01',
            period_end: '2023-11-07',
            content_json: dummyContent
        });

        console.log(`Dummy report created with ID: ${report.id}`);
        console.log(`Store ID: ${store.id}`);
    } catch (error) {
        console.error('Seed error:', error);
    }
}

seed();
