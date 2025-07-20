const crypto = require('crypto');
const User = require('../models/User');

// Middleware для аутентификации Telegram пользователей
const authenticateTelegram = async (req, res, next) => {
    try {
        // Получаем данные из заголовков или тела запроса
        const telegramData = req.headers['x-telegram-data'] || req.body.telegramData;
        const telegramHash = req.headers['x-telegram-hash'] || req.body.telegramHash;
        
        if (!telegramData || !telegramHash) {
            return res.status(401).json({ 
                error: 'Отсутствуют данные Telegram',
                code: 'TELEGRAM_DATA_MISSING'
            });
        }

        // Проверяем подпись Telegram (в продакшене нужно использовать реальный токен бота)
        const botToken = process.env.TELEGRAM_BOT_TOKEN || 'your_bot_token_here';
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const hash = crypto.createHmac('sha256', secretKey).update(telegramData).digest('hex');
        
        if (hash !== telegramHash) {
            console.warn('⚠️ Неверная подпись Telegram:', { received: telegramHash, expected: hash });
            // В режиме разработки пропускаем проверку подписи
            if (process.env.NODE_ENV === 'production') {
                return res.status(401).json({ 
                    error: 'Неверная подпись Telegram',
                    code: 'INVALID_SIGNATURE'
                });
            }
        }

        // Парсим данные пользователя
        const userData = JSON.parse(telegramData);
        const telegramUser = userData.user;

        if (!telegramUser || !telegramUser.id) {
            return res.status(401).json({ 
                error: 'Неверные данные пользователя Telegram',
                code: 'INVALID_USER_DATA'
            });
        }

        // Ищем или создаем пользователя
        let user = await User.findOne({ telegramId: telegramUser.id });
        
        if (!user) {
            // Создаем нового пользователя
            user = new User({
                telegramId: telegramUser.id,
                username: telegramUser.username || null,
                firstName: telegramUser.first_name || null,
                lastName: telegramUser.last_name || null,
                photoUrl: telegramUser.photo_url || null
            });
            await user.save();
            console.log('✅ Создан новый пользователь:', user.telegramId);
        } else {
            // Обновляем данные пользователя
            user.username = telegramUser.username || user.username;
            user.firstName = telegramUser.first_name || user.firstName;
            user.lastName = telegramUser.last_name || user.lastName;
            user.photoUrl = telegramUser.photo_url || user.photoUrl;
            await user.updateActivity();
        }

        // Добавляем пользователя в объект запроса
        req.user = user;
        req.telegramUser = telegramUser;
        
        next();
        
    } catch (error) {
        console.error('❌ Ошибка аутентификации:', error);
        res.status(500).json({ 
            error: 'Ошибка аутентификации',
            code: 'AUTH_ERROR'
        });
    }
};

// Middleware для проверки подключенного кошелька
const requireWallet = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Пользователь не аутентифицирован',
            code: 'USER_NOT_AUTHENTICATED'
        });
    }

    if (!req.user.isWalletConnected || !req.user.walletAddress) {
        return res.status(400).json({ 
            error: 'Кошелек не подключен',
            code: 'WALLET_NOT_CONNECTED'
        });
    }

    next();
};

// Middleware для проверки достаточного баланса
const requireBalance = (minAmount) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Пользователь не аутентифицирован',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        if (req.user.balance < minAmount) {
            return res.status(400).json({ 
                error: `Недостаточно средств. Требуется: ${minAmount} TON, доступно: ${req.user.balance} TON`,
                code: 'INSUFFICIENT_BALANCE',
                required: minAmount,
                available: req.user.balance
            });
        }

        next();
    };
};

module.exports = {
    authenticateTelegram,
    requireWallet,
    requireBalance
}; 