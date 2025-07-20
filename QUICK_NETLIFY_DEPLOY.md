# 🚀 Быстрое развертывание на Netlify

## 📋 Что нужно сделать (5 минут):

### 1. Создание аккаунта Netlify:
1. Перейдите на [Netlify](https://netlify.com)
2. Нажмите "Sign up" (бесплатно)
3. Войдите через GitHub

### 2. Подключение репозитория:
1. Нажмите "New site from Git"
2. Выберите "GitHub"
3. Найдите репозиторий: `vento212/tgtest`
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
   REACT_APP_BACKEND_URL = https://your-railway-url.up.railway.app
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

## ⚠️ Важно:
**Замените `your-railway-url` на реальный URL вашего Railway backend!**

## 🚀 Готово!
Никакого локального запуска не нужно! 