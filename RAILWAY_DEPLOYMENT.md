# 🚂 Развертывание Backend на Railway (Бесплатно)

## 📋 Что получим:
- ✅ **Backend**: Полноценный API сервер
- ✅ **База данных**: MongoDB Atlas
- ✅ **Frontend**: Netlify
- ✅ **Полная функциональность**: Для всех пользователей

## 🚀 Пошаговая инструкция:

### 1. Создание аккаунта Railway:
1. Перейдите на [Railway](https://railway.app)
2. Нажмите "Start a New Project"
3. Войдите через GitHub

### 2. Создание проекта:
1. Нажмите "Deploy from GitHub repo"
2. Выберите репозиторий: `vento212/tgtest`
3. Выберите папку: `backend`
4. Нажмите "Deploy Now"

### 3. Настройка переменных окружения:
1. В проекте Railway перейдите в "Variables"
2. Добавьте переменные:
   ```
   MONGODB_ATLAS_URI = mongodb+srv://tonnelque:cdcdcdcd@cluster0.mgg7dgs.mongodb.net/tgmarket?retryWrites=true&w=majority
   NODE_ENV = production
   PORT = 3001
   ```

### 4. Получение URL:
1. После развертывания Railway даст вам URL
2. Например: `https://tg-market-backend-production.up.railway.app`
3. **Запомните этот URL!**

### 5. Обновление Frontend:
1. В Netlify перейдите в "Site settings" → "Environment variables"
2. Добавьте:
   ```
   REACT_APP_BACKEND_URL = https://your-railway-url.up.railway.app
   ```

## 🎯 Результат:
- **Frontend**: https://your-site.netlify.app
- **Backend**: https://your-app.up.railway.app
- **Database**: MongoDB Atlas

## ⚠️ Важно:
Railway дает $5 кредитов бесплатно каждый месяц. Этого достаточно для небольшого проекта!

## 🚀 Готово!
Теперь ваше приложение будет работать полноценно для всех пользователей! 