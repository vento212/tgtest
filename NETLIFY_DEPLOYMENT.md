# 🚀 Развертывание на Netlify с MongoDB Atlas

## 📋 Предварительные требования

1. ✅ MongoDB Atlas база данных создана
2. ✅ Строка подключения к MongoDB Atlas получена
3. ✅ Backend развернут (Heroku/Railway/Render)

## 🔧 Настройка переменных окружения в Netlify

### 1. В панели Netlify:
- Перейдите в **Site settings** → **Environment variables**
- Добавьте следующие переменные:

```
REACT_APP_API_URL = https://your-backend-url.herokuapp.com
REACT_APP_MONGODB_ATLAS_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ton-payment-app?retryWrites=true&w=majority
```

### 2. Замените значения:
- `your-backend-url.herokuapp.com` → URL вашего backend
- `username:password@cluster0.xxxxx.mongodb.net` → ваша строка подключения MongoDB Atlas

## 🌐 Развертывание Backend

### Вариант 1: Heroku (рекомендуется)
```bash
# Установите Heroku CLI
brew install heroku/brew/heroku

# Войдите в аккаунт
heroku login

# Создайте приложение
cd backend
heroku create your-app-name

# Добавьте переменные окружения
heroku config:set MONGODB_ATLAS_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ton-payment-app?retryWrites=true&w=majority"
heroku config:set TONCENTER_API_KEY="your_api_key"
heroku config:set TELEGRAM_BOT_TOKEN="your_bot_token"

# Разверните
git add .
git commit -m "Deploy backend"
git push heroku main
```

### Вариант 2: Railway
1. Подключите GitHub репозиторий к Railway
2. Выберите папку `backend`
3. Добавьте переменные окружения в Railway dashboard

### Вариант 3: Render
1. Создайте новый Web Service
2. Подключите GitHub репозиторий
3. Укажите папку `backend`
4. Добавьте переменные окружения

## 🔄 Обновление Frontend

### 1. Обновите API URL в коде:
```javascript
// src/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### 2. Убедитесь, что backend работает:
```bash
# Проверьте статус backend
curl https://your-backend-url.herokuapp.com/api/health
```

## 🚀 Развертывание на Netlify

### 1. Подключите GitHub репозиторий:
- В Netlify: **New site from Git**
- Выберите GitHub
- Выберите ваш репозиторий

### 2. Настройте сборку:
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Base directory**: (оставьте пустым)

### 3. Добавьте переменные окружения:
- В **Site settings** → **Environment variables**
- Добавьте все необходимые переменные

### 4. Разверните:
- Нажмите **Deploy site**
- Дождитесь завершения сборки

## ✅ Проверка работы

### 1. Проверьте frontend:
- Откройте ваш Netlify URL
- Проверьте подключение к backend

### 2. Проверьте backend:
```bash
curl https://your-backend-url.herokuapp.com/api/health
```

### 3. Проверьте базу данных:
- В MongoDB Atlas проверьте подключения
- Проверьте создание коллекций

## 🔧 Устранение проблем

### Ошибка "LOAD FAILED":
1. Проверьте URL backend в переменных окружения
2. Убедитесь, что backend запущен
3. Проверьте CORS настройки

### Ошибка подключения к MongoDB:
1. Проверьте строку подключения
2. Убедитесь, что IP адрес добавлен в MongoDB Atlas
3. Проверьте права доступа пользователя

### Ошибка сборки:
1. Проверьте логи сборки в Netlify
2. Убедитесь, что все зависимости установлены
3. Проверьте ESLint ошибки

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Netlify dashboard
2. Проверьте логи backend
3. Проверьте подключение к MongoDB Atlas 