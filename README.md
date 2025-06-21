# Telegram Mini App - TON Payment

Telegram Mini App для приема платежей в криптовалюте TON с использованием Ton Connect SDK.

## 🚀 Возможности

- Подключение TON кошелька через Ton Connect
- Создание платежных ссылок для TON
- Проверка статуса платежей через TON Center API
- Копирование адреса кошелька в буфер обмена
- Современный UI с Tailwind CSS

## 📋 Требования

- Node.js 16+ 
- npm или yarn
- MongoDB (опционально, для backend)

## 🛠 Установка

### 1. Клонирование репозитория

```bash
git clone <your-repo-url>
cd tg-pizdes
```

### 2. Установка зависимостей

```bash
# Установка зависимостей для frontend
npm install

# Установка зависимостей для backend (опционально)
cd backend
npm install
cd ..
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корневой папке:

```env
REACT_APP_TON_WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
REACT_APP_TONCENTER_API_KEY=your_toncenter_api_key_here
```

Для backend создайте файл `backend/config.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ton-payments
TONCENTER_API_KEY=your_toncenter_api_key_here
```

## 🚀 Запуск

### Frontend (основное приложение)

```bash
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

### Backend (опционально)

```bash
cd backend
npm start
```

Backend будет доступен по адресу: http://localhost:3001

### MongoDB (опционально)

Если у вас установлен MongoDB локально:

```bash
# Запуск MongoDB
./start-mongodb.sh

# Или вручную
mongod --dbpath /Users/vento/data/db
```

## 📱 Использование

1. Откройте приложение в браузере или Telegram
2. Нажмите "Connect Wallet" для подключения TON кошелька
3. Нажмите "Buy" для создания платежной ссылки
4. Скопируйте адрес кошелька или используйте прямую ссылку для оплаты
5. После оплаты нажмите "I paid" для проверки статуса платежа

## 🔧 Конфигурация

### Изменение адреса кошелька

Отредактируйте переменную `REACT_APP_TON_WALLET_ADDRESS` в файле `.env.local`

### Получение API ключа TON Center

1. Зарегистрируйтесь на https://toncenter.com
2. Получите API ключ в личном кабинете
3. Добавьте ключ в переменную `REACT_APP_TONCENTER_API_KEY`

## 📁 Структура проекта

```
tg-pizdes/
├── src/                    # Frontend код
│   ├── App.js             # Основной компонент
│   ├── ton-connect.js     # Конфигурация Ton Connect
│   └── icons/             # Иконки
├── backend/               # Backend код (опционально)
│   ├── server.js          # Express сервер
│   ├── models/            # MongoDB модели
│   └── package.json       # Backend зависимости
├── public/                # Статические файлы
├── package.json           # Frontend зависимости
└── README.md              # Документация
```

## 🛠 Технологии

- **Frontend**: React, Tailwind CSS, Ton Connect SDK
- **Backend**: Node.js, Express, MongoDB (опционально)
- **Платежи**: TON Center API
- **Кошелек**: Ton Connect

## 📝 Лицензия

MIT

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории. 