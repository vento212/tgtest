# 🚀 Развертывание Backend на Heroku

## 📋 Что нужно сделать:

### 1. Создание аккаунта Heroku:
1. Перейдите на [Heroku](https://heroku.com)
2. Создайте бесплатный аккаунт
3. Подтвердите email

### 2. Установка Heroku CLI:
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Или скачайте с https://devcenter.heroku.com/articles/heroku-cli
```

### 3. Вход в Heroku:
```bash
heroku login
```

### 4. Создание приложения:
```bash
cd backend
heroku create your-app-name
```

### 5. Настройка переменных окружения:
```bash
heroku config:set MONGODB_ATLAS_URI="mongodb+srv://tonnelque:cdcdcdcd@cluster0.mgg7dgs.mongodb.net/tgmarket?retryWrites=true&w=majority"
heroku config:set NODE_ENV="production"
heroku config:set PORT="3001"
```

### 6. Развертывание:
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### 7. Проверка:
```bash
heroku open
```

## 🔧 Альтернативный способ (через веб-интерфейс):

### 1. Создание приложения:
1. Перейдите на [Heroku Dashboard](https://dashboard.heroku.com)
2. Нажмите "New" → "Create new app"
3. Введите имя приложения
4. Выберите регион (Europe)

### 2. Подключение GitHub:
1. В настройках приложения найдите "Deployment method"
2. Выберите "GitHub"
3. Подключите репозиторий: `vento212/tgtest`
4. Выберите ветку: `main`

### 3. Настройка переменных окружения:
1. Перейдите в "Settings" → "Config Vars"
2. Добавьте переменные:
   ```
   MONGODB_ATLAS_URI = mongodb+srv://tonnelque:cdcdcdcd@cluster0.mgg7dgs.mongodb.net/tgmarket?retryWrites=true&w=majority
   NODE_ENV = production
   PORT = 3001
   ```

### 4. Развертывание:
1. Перейдите в "Deploy"
2. Нажмите "Deploy Branch"

## 🎯 После развертывания:

Ваш backend будет доступен по адресу:
```
https://your-app-name.herokuapp.com
```

**Важно:** Запомните этот URL - он понадобится для настройки frontend! 