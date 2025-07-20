const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const bodyParser = require('body-parser');
const Order = require('./models/Order.js');
const User = require('./models/User.js');
const { authenticateTelegram, requireWallet, requireBalance } = require('./middleware/auth.js');

// Загружаем переменные окружения
dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Ограничение размера JSON

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware для обработки ошибок подключения к БД
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.error('❌ База данных не подключена');
        return res.status(503).json({ 
            error: 'Сервис временно недоступен',
            details: 'База данных не подключена'
        });
    }
    next();
});

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка middleware:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Подключение к MongoDB
const getMongoUri = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
    }
    return process.env.MONGODB_URI || 'mongodb://localhost:27017/ton-payment-app';
};

const mongoUri = getMongoUri();
console.log(`🔗 Подключение к MongoDB: ${process.env.NODE_ENV === 'production' ? 'Atlas (Production)' : 'Local'}`);

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Подключено к MongoDB'))
.catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err);
    console.log('💡 Убедитесь, что MongoDB запущен локально или настроен MongoDB Atlas');
});

// ===== API ENDPOINTS ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =====

// Получение профиля пользователя
app.get('/api/user/profile', authenticateTelegram, async (req, res) => {
    try {
        const user = req.user;
        
        // Получаем статистику заказов
        const orderStats = await Order.aggregate([
            { $match: { userId: user._id } },
            { 
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    successfulOrders: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
                    totalSpent: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } }
                }
            }
        ]);

        const stats = orderStats[0] || { totalOrders: 0, successfulOrders: 0, totalSpent: 0 };

        res.json({
            user: {
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                photoUrl: user.photoUrl,
                walletAddress: user.walletAddress,
                isWalletConnected: user.isWalletConnected,
                balance: user.balance,
                lastActivity: user.lastActivity,
                createdAt: user.createdAt
            },
            stats: {
                totalOrders: stats.totalOrders,
                successfulOrders: stats.successfulOrders,
                totalSpent: stats.totalSpent
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка получения профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Подключение кошелька
app.post('/api/user/connect-wallet', authenticateTelegram, async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const user = req.user;

        if (!walletAddress || typeof walletAddress !== 'string') {
            return res.status(400).json({ error: 'Неверный адрес кошелька' });
        }

        // Валидация адреса TON кошелька (базовая проверка)
        if (!walletAddress.startsWith('EQ') && !walletAddress.startsWith('UQ')) {
            return res.status(400).json({ error: 'Неверный формат адреса TON кошелька' });
        }

        await user.connectWallet(walletAddress);
        
        console.log('✅ Кошелек подключен для пользователя:', user.telegramId);
        res.json({ 
            success: true, 
            message: 'Кошелек успешно подключен',
            walletAddress: user.walletAddress
        });
        
    } catch (error) {
        console.error('❌ Ошибка подключения кошелька:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Отключение кошелька
app.post('/api/user/disconnect-wallet', authenticateTelegram, async (req, res) => {
    try {
        const user = req.user;
        await user.disconnectWallet();
        
        console.log('✅ Кошелек отключен для пользователя:', user.telegramId);
        res.json({ 
            success: true, 
            message: 'Кошелек отключен'
        });
        
    } catch (error) {
        console.error('❌ Ошибка отключения кошелька:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Пополнение баланса
app.post('/api/user/deposit', authenticateTelegram, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = req.user;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Неверная сумма пополнения' });
        }

        if (amount > 1000) {
            return res.status(400).json({ error: 'Сумма слишком большая' });
        }

        // Генерируем уникальный комментарий для депозита
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const comment = `deposit_${user.telegramId}_${timestamp}_${randomId}`;
        
        // Конвертируем TON в nanoTON
        const amountNano = Math.floor(amount * 1000000000);
        
        // Адрес кошелька для приема платежей
        const merchantWalletAddress = process.env.WALLET_ADDRESS || 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G';
        
        // Создаем заказ на депозит
        const depositOrder = new Order({
            userId: user._id,
            telegramId: user.telegramId,
            itemId: 0, // Специальный ID для депозита
            itemName: 'Пополнение баланса',
            amount: amount,
            amountNano: amountNano,
            comment: comment,
            status: 'pending',
            merchantWalletAddress: merchantWalletAddress,
            paymentMethod: 'external_wallet'
        });
        
        await depositOrder.save();
        
        console.log('✅ Заказ на депозит создан:', depositOrder._id);
        
        res.json({
            success: true,
            order: depositOrder,
            deeplink: `ton://transfer/${merchantWalletAddress}?amount=${amountNano}&text=${encodeURIComponent(comment)}`
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания депозита:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вывод средств
app.post('/api/user/withdraw', authenticateTelegram, requireWallet, requireBalance(0.1), async (req, res) => {
    try {
        const { amount, toAddress } = req.body;
        const user = req.user;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Неверная сумма вывода' });
        }

        if (!toAddress || typeof toAddress !== 'string') {
            return res.status(400).json({ error: 'Неверный адрес получателя' });
        }

        if (amount > user.balance) {
            return res.status(400).json({ 
                error: 'Недостаточно средств',
                available: user.balance,
                requested: amount
            });
        }

        // Минимальная комиссия за вывод
        const minWithdrawal = 0.1;
        if (amount < minWithdrawal) {
            return res.status(400).json({ 
                error: `Минимальная сумма вывода: ${minWithdrawal} TON`
            });
        }

        // Списываем средства с баланса пользователя
        await user.deductBalance(amount);
        
        console.log('✅ Средства выведены для пользователя:', user.telegramId, 'сумма:', amount);
        
        res.json({
            success: true,
            message: 'Средства успешно выведены',
            amount: amount,
            newBalance: user.balance
        });
        
    } catch (error) {
        console.error('❌ Ошибка вывода средств:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ENDPOINTS ДЛЯ ЗАКАЗОВ =====

// Создание заказа
app.post('/api/orders', authenticateTelegram, async (req, res) => {
    try {
        const { itemId, itemName, itemTokenId, amount, paymentMethod = 'external_wallet' } = req.body;
        const user = req.user;
        
        // Валидация входных данных
        if (!itemId || !itemName || !amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Неверные данные заказа' });
        }

        // Ограничение максимальной суммы
        if (amount > 1000) {
            return res.status(400).json({ error: 'Сумма слишком большая' });
        }

        // Проверяем баланс если используется внутренний баланс
        if (paymentMethod === 'wallet_balance') {
            if (!user.isWalletConnected) {
                return res.status(400).json({ error: 'Кошелек не подключен для оплаты балансом' });
            }
            if (user.balance < amount) {
                return res.status(400).json({ 
                    error: 'Недостаточно средств на балансе',
                    available: user.balance,
                    required: amount
                });
            }
        }

        // Генерируем уникальный комментарий
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const comment = `order_${user.telegramId}_${itemId}_${timestamp}_${randomId}`;
        
        // Конвертируем TON в nanoTON
        const amountNano = Math.floor(amount * 1000000000);
        
        // Адрес кошелька для приема платежей
        const merchantWalletAddress = process.env.WALLET_ADDRESS || 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G';
        
        // Создаем заказ в MongoDB
        const order = new Order({
            userId: user._id,
            telegramId: user.telegramId,
            itemId: itemId,
            itemName: itemName,
            itemTokenId: itemTokenId,
            amount: amount,
            amountNano: amountNano,
            comment: comment,
            status: 'pending',
            userWalletAddress: user.walletAddress,
            merchantWalletAddress: merchantWalletAddress,
            paymentMethod: paymentMethod
        });
        
        await order.save();
        
        // Если оплата через баланс, сразу списываем средства
        if (paymentMethod === 'wallet_balance') {
            await user.deductBalance(amount);
            await order.markAsPaid();
            user.totalOrders += 1;
            user.successfulOrders += 1;
            await user.save();
        }
        
        console.log('✅ Заказ создан:', order._id);
        
        const response = {
            order: order,
            deeplink: paymentMethod === 'external_wallet' 
                ? `ton://transfer/${merchantWalletAddress}?amount=${amountNano}&text=${encodeURIComponent(comment)}`
                : null
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + (error.message || 'Неизвестная ошибка') });
    }
});

// Проверка статуса заказа
app.get('/api/orders/:comment/status', async (req, res) => {
    try {
        const { comment } = req.params;
        
        // Валидация комментария
        if (!comment || typeof comment !== 'string' || comment.length < 10) {
            return res.status(400).json({ error: 'Неверный комментарий заказа' });
        }
        
        // Получаем заказ из MongoDB
        const order = await Order.findOne({ comment: comment });
        
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        // Если заказ уже оплачен, возвращаем статус
        if (order.status === 'paid') {
            return res.json({ status: 'paid' });
        }
        
        // Если заказ истек, возвращаем статус
        if (order.isExpired) {
            await order.markAsExpired();
            return res.json({ status: 'expired' });
        }
        
        // Проверяем оплату через TON Center API только для внешних платежей
        if (order.paymentMethod === 'external_wallet') {
            const walletAddress = order.merchantWalletAddress;
            const expectedAmount = order.amountNano;
            const expectedComment = order.comment;
            
            try {
                const apiKey = process.env.TONCENTER_API_KEY;
                if (!apiKey || apiKey === 'your_toncenter_api_key_here') {
                    console.warn('⚠️ API ключ TON Center не настроен');
                    return res.json({ status: 'pending' });
                }
                
                const response = await axios.get(
                    `${process.env.TONCENTER_BASE_URL || 'https://toncenter.com/api/v2'}/getTransactions`,
                    {
                        params: {
                            address: walletAddress,
                            limit: 10
                        },
                        headers: {
                            'X-API-Key': apiKey
                        },
                        timeout: 10000
                    }
                );
                
                if (!response.data || !response.data.result) {
                    throw new Error('Неверный формат ответа от API');
                }
                
                const transactions = response.data.result;
                
                // Ищем транзакцию с нужной суммой и комментарием
                const payment = transactions.find(tx => 
                    tx.in_msg &&
                    tx.in_msg.value === expectedAmount.toString() &&
                    tx.in_msg.message && 
                    tx.in_msg.message.includes(expectedComment)
                );
                
                if (payment) {
                    // Обновляем статус заказа
                    await order.markAsPaid(payment.transaction_id?.hash);
                    
                    // Если это депозит, пополняем баланс пользователя
                    if (order.itemId === 0) {
                        const user = await User.findById(order.userId);
                        if (user) {
                            await user.addBalance(order.amount);
                            console.log('✅ Баланс пополнен для пользователя:', user.telegramId);
                        }
                    } else {
                        // Увеличиваем счетчики заказов
                        const user = await User.findById(order.userId);
                        if (user) {
                            user.totalOrders += 1;
                            user.successfulOrders += 1;
                            await user.save();
                        }
                    }
                    
                    console.log('✅ Оплата найдена для заказа:', comment);
                    res.json({ status: 'paid' });
                } else {
                    res.json({ status: 'pending' });
                }
                
            } catch (apiError) {
                console.error('❌ Ошибка API TON Center:', apiError.message);
                res.json({ status: 'pending' });
            }
        } else {
            res.json({ status: order.status });
        }
        
    } catch (error) {
        console.error('❌ Ошибка проверки статуса:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + (error.message || 'Неизвестная ошибка') });
    }
});

// Получение заказов пользователя
app.get('/api/user/orders', authenticateTelegram, async (req, res) => {
    try {
        const user = req.user;
        const { status, limit = 20, offset = 0 } = req.query;
        
        const filter = { userId: user._id };
        if (status && ['pending', 'paid', 'expired', 'cancelled'].includes(status)) {
            filter.status = status;
        }
        
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));
            
        const total = await Order.countDocuments(filter);
        
        res.json({
            orders: orders,
            total: total,
            hasMore: total > parseInt(offset) + orders.length
        });
        
    } catch (error) {
        console.error('❌ Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение всех заказов (для отладки)
app.get('/api/orders', async (req, res) => {
    try {
        const allOrders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'telegramId username');
        res.json(allOrders);
    } catch (error) {
        console.error('❌ Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`)); 