# 🚀 Улучшенная система TON Marketplace

## 📋 Что было исправлено и улучшено

### ✅ Основные проблемы, которые решены:

1. **Проблема с подключением Telegram аккаунтов**
   - Добавлена правильная аутентификация через Telegram WebApp
   - Создана система профилей пользователей с сохранением в MongoDB
   - Реализована проверка подписи Telegram для безопасности

2. **Проблема с сохранением баланса**
   - Создана система внутреннего баланса пользователей
   - Баланс сохраняется в базе данных и привязан к Telegram ID
   - Добавлена возможность пополнения и вывода средств

3. **Улучшена интеграция с TON Connect**
   - Правильная обработка подключения/отключения кошельков
   - Сохранение адреса кошелька в профиле пользователя
   - Два способа оплаты: через внешний кошелек и внутренний баланс

## 🛠️ Установка и настройка

### 1. Настройка базы данных MongoDB

```bash
# Установка MongoDB (macOS)
brew install mongodb-community

# Запуск MongoDB
brew services start mongodb-community

# Или через скрипт
./start-mongodb.sh
```

### 2. Настройка переменных окружения

#### Backend (backend/config.env):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ton-payment-app
TONCENTER_API_KEY=your_toncenter_api_key_here
TONCENTER_BASE_URL=https://toncenter.com/api/v2
WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=development
```

#### Frontend (env.local):
```env
REACT_APP_BACKEND_URL=http://localhost:3001
GENERATE_SOURCEMAP=false
REACT_APP_TON_WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
REACT_APP_TONCENTER_API_KEY=your_toncenter_api_key_here
REACT_APP_WALLET_ADDRESS=UQBlcF9j3mvxaLCKeB1APahO9wpqvd91BIn_mUgm9_lDE_4k
```

### 3. Получение API ключей

#### TON Center API Key:
1. Зайдите на [toncenter.com](https://toncenter.com)
2. Зарегистрируйтесь и получите API ключ
3. Добавьте ключ в переменные окружения

#### Telegram Bot Token:
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Добавьте токен в `TELEGRAM_BOT_TOKEN`

### 4. Запуск приложения

```bash
# Установка зависимостей
npm install
cd backend && npm install

# Запуск MongoDB
./start-mongodb.sh

# Запуск бэкенда (в отдельном терминале)
cd backend
npm run dev

# Запуск фронтенда (в отдельном терминале)
npm start
```

## 🔧 Новые возможности

### 1. Система профилей пользователей
- Автоматическое создание профиля при первом входе
- Сохранение данных Telegram пользователя
- Статистика заказов и покупок

### 2. Внутренний баланс
- Пополнение баланса через TON кошелек
- Покупка товаров за внутренний баланс
- Вывод средств на внешний кошелек

### 3. Улучшенная аутентификация
- Проверка подписи Telegram WebApp
- Безопасная передача данных пользователя
- Middleware для защиты API endpoints

### 4. Два способа оплаты
- **Внешний кошелек**: прямая оплата через TON Connect
- **Внутренний баланс**: оплата за счет пополненного баланса

## 📱 API Endpoints

### Пользователи
- `GET /api/user/profile` - Получение профиля
- `POST /api/user/connect-wallet` - Подключение кошелька
- `POST /api/user/disconnect-wallet` - Отключение кошелька
- `POST /api/user/deposit` - Пополнение баланса
- `POST /api/user/withdraw` - Вывод средств
- `GET /api/user/orders` - Заказы пользователя

### Заказы
- `POST /api/orders` - Создание заказа
- `GET /api/orders/:comment/status` - Проверка статуса
- `GET /api/orders` - Все заказы (отладка)

## 🗄️ Структура базы данных

### Модель User
```javascript
{
  telegramId: Number,        // ID пользователя в Telegram
  username: String,          // Username в Telegram
  firstName: String,         // Имя
  lastName: String,          // Фамилия
  photoUrl: String,          // URL фото профиля
  walletAddress: String,     // Адрес подключенного кошелька
  balance: Number,           // Внутренний баланс
  isWalletConnected: Boolean, // Статус подключения кошелька
  totalSpent: Number,        // Общая сумма покупок
  totalOrders: Number,       // Общее количество заказов
  successfulOrders: Number   // Успешные заказы
}
```

### Модель Order
```javascript
{
  userId: ObjectId,          // Ссылка на пользователя
  telegramId: Number,        // ID пользователя в Telegram
  itemId: Number,            // ID товара
  itemName: String,          // Название товара
  amount: Number,            // Сумма в TON
  amountNano: Number,        // Сумма в nanoTON
  comment: String,           // Уникальный комментарий
  status: String,            // Статус заказа
  paymentMethod: String,     // Способ оплаты
  userWalletAddress: String, // Адрес кошелька пользователя
  merchantWalletAddress: String, // Адрес кошелька продавца
  transactionHash: String    // Хеш транзакции
}
```

## 🔒 Безопасность

### Аутентификация Telegram
- Проверка подписи Telegram WebApp
- Валидация данных пользователя
- Защита от подделки запросов

### Валидация данных
- Проверка адресов TON кошельков
- Валидация сумм платежей
- Ограничения на максимальные суммы

### Защита API
- Middleware для аутентификации
- Проверка прав доступа
- Логирование всех операций

## 🚀 Деплой

### Локальный тест
```bash
# Запуск в режиме разработки
npm run dev

# Тест API
curl http://localhost:3001/api/orders
```

### Продакшн деплой
1. Настройте MongoDB Atlas
2. Получите API ключи
3. Настройте переменные окружения
4. Деплойте на Heroku/Vercel/Netlify

## 🐛 Отладка

### Проверка подключения к базе данных
```bash
# Подключение к MongoDB
mongosh mongodb://localhost:27017/ton-payment-app

# Просмотр коллекций
show collections

# Просмотр пользователей
db.users.find()

# Просмотр заказов
db.orders.find()
```

### Логи сервера
```bash
# Просмотр логов в реальном времени
tail -f backend/logs/server.log
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности API ключей
3. Проверьте подключение к MongoDB
4. Убедитесь, что приложение запущено в Telegram

## 🎯 Следующие шаги

1. Добавить систему уведомлений
2. Реализовать реферальную систему
3. Добавить аналитику и статистику
4. Создать админ-панель
5. Добавить поддержку других криптовалют 