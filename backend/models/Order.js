const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'expired'],
        default: 'pending'
    },
    walletAddress: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Автоматически удалять через 1 час
    }
});

module.exports = mongoose.model('Order', orderSchema); 