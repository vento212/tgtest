# TON Payment Backend

Бэкенд для Telegram mini-app с платежами в TON.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Настройте переменные окружения в файле `config.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ton-payment-app
TONCENTER_API_KEY=your_toncenter_api_key_here
TONCENTER_BASE_URL=https://toncenter.com/api/v2
WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
```

## Настройка MongoDB

### Локальная установка:
1. Установите MongoDB: https://docs.mongodb.com/manual/installation/
2. Запустите MongoDB сервис
3. База данных создастся автоматически при первом запуске

### MongoDB Atlas (облачное решение):
1. Создайте аккаунт на https://www.mongodb.com/atlas
2. Создайте кластер
3. Получите connection string и замените `MONGODB_URI` в `config.env`

## Получение TON Center API Key

1. Перейдите на https://toncenter.com/
2. Зарегистрируйтесь и получите API ключ
3. Добавьте ключ в `config.env`

## Запуск

### Режим разработки:
```bash
npm run dev
```

### Продакшн:
```bash
npm start
```

## API Endpoints

### Создание заказа
```
POST /api/orders
Content-Type: application/json

{
  "amount": 1.5
}
```

### Проверка статуса заказа
```
GET /api/orders/:comment/status
```

### Получение всех заказов
```
GET /api/orders
```

## Деплой

### Heroku:
1. Создайте приложение на Heroku
2. Добавьте MongoDB Atlas addon
3. Настройте переменные окружения в Heroku dashboard
4. Деплойте код

### Vercel:
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Деплойте

### Railway:
1. Подключите GitHub репозиторий
2. Добавьте MongoDB service
3. Настройте переменные окружения
4. Деплойте 