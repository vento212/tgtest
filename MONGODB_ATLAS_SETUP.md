# 🔧 Настройка MongoDB Atlas для продакшена

## Проблема
Приложение использует локальную базу данных MongoDB, которая недоступна на Netlify. Нужно настроить MongoDB Atlas (облачная база данных).

## Решение

### 1. Создание аккаунта MongoDB Atlas
1. Перейдите на [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Создайте бесплатный аккаунт
3. Создайте новый кластер (бесплатный tier)

### 2. Настройка базы данных
1. В кластере создайте базу данных `ton-payment-app`
2. Создайте пользователя с правами read/write
3. Получите строку подключения

### 3. Настройка переменных окружения на Netlify
В настройках Netlify добавьте следующие переменные:

```
NODE_ENV=production
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/ton-payment-app?retryWrites=true&w=majority
TONCENTER_API_KEY=5b9f36ace1197dc5d9dba4abdc2198c56bc722e8527f0e2f5266f2d0e3366579
TONCENTER_BASE_URL=https://toncenter.com/api/v2
WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 4. Настройка IP адресов
В MongoDB Atlas разрешите доступ с любых IP адресов (0.0.0.0/0) для Netlify.

### 5. Альтернативное решение - временный fallback
Если MongoDB Atlas не настроен, приложение будет показывать сообщение об ошибке подключения к базе данных.

## Проверка
После настройки приложение должно работать без ошибок "LOAD FAILED". 