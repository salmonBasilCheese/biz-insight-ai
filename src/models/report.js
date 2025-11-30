import { DataTypes } from 'sequelize';

const defineReport = (sequelize) => {
    const Report = sequelize.define('Report', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        period_start: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        period_end: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        content_json: {
            type: DataTypes.JSON,
            allowNull: true
        },
        pdf_path: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Report;
};

export default defineReport;
