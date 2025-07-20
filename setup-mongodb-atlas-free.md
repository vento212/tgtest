# 🆓 Настройка MongoDB Atlas (Бесплатно)

## Шаг 1: Создание аккаунта
1. Перейдите на [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Нажмите "Try Free"
3. Заполните форму регистрации

## Шаг 2: Создание бесплатного кластера
1. Выберите **"FREE"** план (M0)
2. Выберите провайдера: **AWS, Google Cloud, или Azure** (любой)
3. Выберите регион: **Frankfurt (eu-central-1)** или ближайший к вам
4. Нажмите "Create"

## Шаг 3: Настройка безопасности
1. **Database Access** → "Add New Database User"
   - Username: `admin`
   - Password: `ваш_пароль_123`
   - Role: `Atlas admin`
   - Нажмите "Add User"

2. **Network Access** → "Add IP Address"
   - Нажмите "Allow Access from Anywhere" (0.0.0.0/0)
   - Нажмите "Confirm"

## Шаг 4: Получение строки подключения
1. Нажмите "Connect"
2. Выберите "Connect your application"
3. Скопируйте строку подключения

## Шаг 5: Обновление конфигурации

### В файле `backend/config.env`:
```
MONGODB_URI=mongodb+srv://admin:ваш_пароль_123@cluster0.xxxxx.mongodb.net/tgmarket?retryWrites=true&w=majority
```

### В файле `netlify.toml`:
```toml
[build.environment]
  REACT_APP_MONGODB_URI=mongodb+srv://admin:ваш_пароль_123@cluster0.xxxxx.mongodb.net/tgmarket?retryWrites=true&w=majority
```

## ⚠️ Важно:
- Бесплатный план: 512MB RAM, 5GB storage
- Подходит для разработки и небольших проектов
- Максимум 500 подключений одновременно

## 🚀 После настройки:
1. Обновите переменные окружения
2. Перезапустите приложение
3. Проверьте подключение к базе данных 