import { DataTypes } from 'sequelize';

const defineReview = (sequelize) => {
    const Review = sequelize.define('Review', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        provider: {
            type: DataTypes.STRING,
            defaultValue: 'google'
        },
        external_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        review_text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        sentiment: {
            type: DataTypes.ENUM('positive', 'negative', 'neutral'),
            allowNull: true
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        collected_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Review;
};

export default defineReview;
