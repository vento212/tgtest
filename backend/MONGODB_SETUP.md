# Настройка MongoDB Atlas

Поскольку локальная установка MongoDB занимает много времени, используем MongoDB Atlas (облачную версию).

## Шаги настройки:

### 1. Создание аккаунта MongoDB Atlas
1. Перейдите на https://www.mongodb.com/atlas
2. Нажмите "Try Free" и создайте аккаунт
3. Войдите в аккаунт

### 2. Создание кластера
1. Нажмите "Build a Database"
2. Выберите "FREE" план (M0)
3. Выберите провайдера (AWS, Google Cloud, или Azure)
4. Выберите регион (ближайший к вам)
5. Нажмите "Create"

### 3. Настройка безопасности
1. Создайте пользователя базы данных:
   - Username: `tonapp`
   - Password: `your_secure_password`
   - Нажмите "Create User"

2. Настройте сетевой доступ:
   - Нажмите "Network Access"
   - Нажмите "Add IP Address"
   - Выберите "Allow Access from Anywhere" (0.0.0.0/0)
   - Нажмите "Confirm"

### 4. Получение connection string
1. Нажмите "Connect"
2. Выберите "Connect your application"
3. Скопируйте connection string
4. Замените `<password>` на ваш пароль
5. Замените `<dbname>` на `ton-payment-app`

### 5. Обновление конфигурации
Обновите файл `config.env`:
```env
MONGODB_URI=mongodb+srv://tonapp:your_password@cluster0.xxxxx.mongodb.net/ton-payment-app?retryWrites=true&w=majority
```

### 6. Запуск приложения
```bash
cd backend
npm start
```

## Альтернатива: Docker MongoDB

Если хотите использовать локальную MongoDB через Docker:

```bash
# Установите Docker Desktop
# Затем запустите MongoDB:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Обновите config.env:
MONGODB_URI=mongodb://localhost:27017/ton-payment-app
``` 