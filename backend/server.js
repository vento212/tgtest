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
app.use(express.json());

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
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Неверная сумма' });
        }

        // Генерируем уникальный комментарий
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const comment = `order_${timestamp}_${randomId}`;
        
        // Конвертируем TON в nanoTON
        const amountNano = Math.floor(amount * 1000000000);
        
        // Создаем заказ в MongoDB
        const order = new Order({
            amount: amount,
            amountNano: amountNano,
            comment: comment,
            status: 'pending',
            walletAddress: process.env.WALLET_ADDRESS || 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G'
        });
        
        await order.save();
        
        console.log('✅ Заказ создан:', order);
        res.json(order);
        
    } catch (error) {
        console.error('❌ Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Проверка статуса заказа
app.get('/api/orders/:comment/status', async (req, res) => {
    try {
        const { comment } = req.params;
        
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
        
        try {
            const response = await axios.get(
                `${process.env.TONCENTER_BASE_URL || 'https://toncenter.com/api/v2'}/getTransactions`,
                {
                    params: {
                        address: walletAddress,
                        limit: 10
                    },
                    headers: {
                        'X-API-Key': process.env.TONCENTER_API_KEY || 'test'
                    }
                }
            );
            
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
        res.status(500).json({ error: 'Ошибка сервера' });
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