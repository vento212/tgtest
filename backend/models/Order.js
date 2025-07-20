const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Связь с пользователем
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    telegramId: {
        type: Number,
        required: true
    },
    // Информация о товаре
    itemId: {
        type: Number,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemTokenId: {
        type: String,
        required: false
    },
    // Финансовая информация
    amount: {
        type: Number,
        required: true
    },
    amountNano: {
        type: Number,
        required: true
    },
    // Платежная информация
    comment: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'expired', 'cancelled'],
        default: 'pending'
    },
    // Адреса кошельков
    userWalletAddress: {
        type: String,
        required: false
    },
    merchantWalletAddress: {
        type: String,
        required: true
    },
    // Временные метки
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Автоматически удалять через 1 час
    },
    paidAt: {
        type: Date,
        required: false
    },
    // Дополнительная информация
    paymentMethod: {
        type: String,
        enum: ['wallet_balance', 'external_wallet'],
        default: 'external_wallet'
    },
    transactionHash: {
        type: String,
        required: false
    }
});

// Индексы для быстрого поиска
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ telegramId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ comment: 1 });

// Виртуальное поле для времени жизни заказа
orderSchema.virtual('isExpired').get(function() {
    const now = new Date();
    const created = this.createdAt;
    const oneHour = 60 * 60 * 1000; // 1 час в миллисекундах
    return (now - created) > oneHour;
});

// Метод для пометки заказа как оплаченного
orderSchema.methods.markAsPaid = function(transactionHash = null) {
    this.status = 'paid';
    this.paidAt = new Date();
    if (transactionHash) {
        this.transactionHash = transactionHash;
    }
    return this.save();
};

// Метод для пометки заказа как истекшего
orderSchema.methods.markAsExpired = function() {
    this.status = 'expired';
    return this.save();
};

// Метод для отмены заказа
orderSchema.methods.cancel = function() {
    this.status = 'cancelled';
    return this.save();
};

module.exports = mongoose.model('Order', orderSchema); 