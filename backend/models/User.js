const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    photoUrl: {
        type: String,
        required: false
    },
    walletAddress: {
        type: String,
        required: false
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    isWalletConnected: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Дополнительные поля для статистики
    totalSpent: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    successfulOrders: {
        type: Number,
        default: 0
    }
});

// Индекс для быстрого поиска по telegramId
userSchema.index({ telegramId: 1 });

// Метод для обновления последней активности
userSchema.methods.updateActivity = function() {
    this.lastActivity = new Date();
    return this.save();
};

// Метод для пополнения баланса
userSchema.methods.addBalance = function(amount) {
    if (amount > 0) {
        this.balance += amount;
        return this.save();
    }
    return Promise.resolve(this);
};

// Метод для списания баланса
userSchema.methods.deductBalance = function(amount) {
    if (amount > 0 && this.balance >= amount) {
        this.balance -= amount;
        this.totalSpent += amount;
        return this.save();
    }
    return Promise.reject(new Error('Недостаточно средств'));
};

// Метод для подключения кошелька
userSchema.methods.connectWallet = function(walletAddress) {
    this.walletAddress = walletAddress;
    this.isWalletConnected = true;
    return this.save();
};

// Метод для отключения кошелька
userSchema.methods.disconnectWallet = function() {
    this.walletAddress = null;
    this.isWalletConnected = false;
    return this.save();
};

module.exports = mongoose.model('User', userSchema); 