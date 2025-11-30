import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import defineUser from './user.js';
import defineStore from './store.js';
import defineSale from './sale.js';
import defineReview from './review.js';
import defineReport from './report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
});

export default sequelize;

// Initialize models
const User = defineUser(sequelize);
const Store = defineStore(sequelize);
const Sale = defineSale(sequelize);
const Review = defineReview(sequelize);
const Report = defineReport(sequelize);

// Define associations
User.hasMany(Store, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Store.belongsTo(User, { foreignKey: 'user_id' });

Store.hasMany(Sale, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Sale.belongsTo(Store, { foreignKey: 'store_id' });

Store.hasMany(Review, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Review.belongsTo(Store, { foreignKey: 'store_id' });

Store.hasMany(Report, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Report.belongsTo(Store, { foreignKey: 'store_id' });

// Export models
export { User, Store, Sale, Review, Report };

// Sync database
export const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('✅ Database synchronized');
    } catch (error) {
        console.error('❌ Database sync error:', error);
        throw error;
    }
};
