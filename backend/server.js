const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const bodyParser = require('body-parser');
const Order = require('./models/Order.js');

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

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка middleware:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/ton-payment-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Подключено к MongoDB'))
.catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Создание заказа
app.post('/api/orders', async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Валидация входных данных
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Неверная сумма' });
        }

        // Ограничение максимальной суммы
        if (amount > 1000) {
            return res.status(400).json({ error: 'Сумма слишком большая' });
        }

        // Генерируем уникальный комментарий
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const comment = `order_${timestamp}_${randomId}`;
        
        // Конвертируем TON в nanoTON
        const amountNano = Math.floor(amount * 1000000000);
        
        // Валидация адреса кошелька
        const walletAddress = process.env.WALLET_ADDRESS || 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G';
        if (!walletAddress || walletAddress.length < 10) {
            return res.status(500).json({ error: 'Неверный адрес кошелька' });
        }
        
        // Создаем заказ в MongoDB
        const order = new Order({
            amount: amount,
            amountNano: amountNano,
            comment: comment,
            status: 'pending',
            walletAddress: walletAddress
        });
        
        await order.save();
        
        console.log('✅ Заказ создан:', order);
        res.json(order);
        
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
        
        // Проверяем оплату через TON Center API
        const walletAddress = order.walletAddress;
        const expectedAmount = order.amountNano;
        const expectedComment = order.comment;
        
        // Валидация данных заказа
        if (!walletAddress || !expectedAmount || !expectedComment) {
            return res.status(500).json({ error: 'Неполные данные заказа' });
        }
        
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
                    timeout: 10000 // 10 секунд таймаут
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
                // Обновляем статус заказа в MongoDB
                order.status = 'paid';
                order.paidAt = new Date();
                await order.save();
                
                console.log('✅ Оплата найдена для заказа:', comment);
                res.json({ status: 'paid' });
            } else {
                res.json({ status: 'pending' });
            }
            
        } catch (apiError) {
            console.error('❌ Ошибка API TON Center:', apiError.message);
            res.json({ status: 'pending' });
        }
        
    } catch (error) {
        console.error('❌ Ошибка проверки статуса:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + (error.message || 'Неизвестная ошибка') });
    }
});

// Получение всех заказов (для отладки)
app.get('/api/orders', async (req, res) => {
    try {
        const allOrders = await Order.find().sort({ createdAt: -1 });
        res.json(allOrders);
    } catch (error) {
        console.error('❌ Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`)); 