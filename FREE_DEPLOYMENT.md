# 🆓 Бесплатное развертывание на Netlify

## 🎯 Что получим:
- ✅ **Frontend**: Работает в демо режиме
- ✅ **MongoDB Atlas**: База данных (бесплатно)
- ✅ **Полностью бесплатно!**

## 📋 Пошаговая инструкция:

### 1. Создание аккаунта Netlify:
1. Перейдите на [Netlify](https://netlify.com)
2. Нажмите "Sign up" (бесплатно)
3. Подтвердите email

### 2. Подключение GitHub:
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
2. Добавьте:
   ```
   REACT_APP_MONGODB_ATLAS_URI = mongodb+srv://tonnelque:cdcdcdcd@cluster0.mgg7dgs.mongodb.net/tgmarket?retryWrites=true&w=majority
   ```

### 5. Развертывание:
1. Нажмите "Deploy site"
2. Дождитесь завершения сборки

## 🎯 Результат:
Ваш сайт будет доступен по адресу:
```
https://your-site-name.netlify.app
```

## ⚠️ Что будет работать:
- ✅ Интерфейс приложения
- ✅ Демо режим
- ✅ Локальное сохранение данных
- ✅ Подключение к MongoDB Atlas

## ❌ Что НЕ будет работать:
- API запросы к backend
- Серверная аутентификация
- Серверная обработка платежей

## 🚀 Готово!
Приложение будет работать в демо режиме, но полностью функционально! 