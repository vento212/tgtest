# 🌐 Развертывание Frontend на Netlify

## 📋 Что нужно сделать:

### 1. Создание аккаунта Netlify:
1. Перейдите на [Netlify](https://netlify.com)
2. Нажмите "Sign up" и создайте аккаунт
3. Подтвердите email

### 2. Подключение GitHub репозитория:
1. В Netlify нажмите "New site from Git"
2. Выберите "GitHub"
3. Подключите репозиторий: `vento212/tgtest`
4. Выберите ветку: `main`

### 3. Настройка сборки:
```
Build command: npm run build
Publish directory: build
Base directory: (оставьте пустым)
```

### 4. Переменные окружения:
1. Перейдите в "Site settings" → "Environment variables"
2. Добавьте переменные:
   ```
   REACT_APP_BACKEND_URL = https://your-app-name.herokuapp.com
   REACT_APP_MONGODB_ATLAS_URI = mongodb+srv://tonnelque:cdcdcdcd@cluster0.mgg7dgs.mongodb.net/tgmarket?retryWrites=true&w=majority
   ```

### 5. Развертывание:
1. Нажмите "Deploy site"
2. Дождитесь завершения сборки

## 🎯 После развертывания:

Ваш frontend будет доступен по адресу:
```
https://your-site-name.netlify.app
```

## ⚠️ Важно:

**Замените `your-app-name` на реальное имя вашего Heroku приложения!**

Например, если ваше Heroku приложение называется `tg-market-backend`, то:
```
REACT_APP_BACKEND_URL = https://tg-market-backend.herokuapp.com
```

## 🔧 Проверка работы:

1. Откройте ваш Netlify сайт
2. Проверьте, что приложение загружается
3. Попробуйте создать заказ
4. Проверьте подключение к базе данных

## 🚀 Готово!

Теперь у вас есть:
- ✅ **Frontend**: https://your-site-name.netlify.app
- ✅ **Backend**: https://your-app-name.herokuapp.com
- ✅ **Database**: MongoDB Atlas 