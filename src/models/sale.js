import { DataTypes } from 'sequelize';

const defineSale = (sequelize) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        revenue: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        visitors: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        new_customers: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Sale;
};

export default defineSale;
