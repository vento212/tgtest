# 🚀 Настройка Telegram бота для WebApp

## 📱 Шаг 1: Создание бота

1. **Откройте Telegram**
2. **Найдите @BotFather**
3. **Отправьте команду:** `/newbot`
4. **Введите имя бота:** `TON Market Bot`
5. **Введите username:** `your_ton_market_bot` (должен заканчиваться на `bot`)
6. **Скопируйте токен бота** (что-то вроде `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## ⚙️ Шаг 2: Настройка WebApp

### Вариант A: Через @BotFather

1. **Отправьте @BotFather:** `/setmenubutton`
2. **Выберите вашего бота**
3. **Введите текст кнопки:** `Открыть TON Market`
4. **Введите URL:** `https://your-app-name.netlify.app`

### Вариант B: Через код

1. **Установите зависимость:**
   ```bash
   npm install node-telegram-bot-api
   ```

2. **Отредактируйте `setup-bot.js`:**
   - Замените `YOUR_BOT_TOKEN_HERE` на ваш токен
   - Замените `your-app-name.netlify.app` на ваш URL

3. **Запустите скрипт:**
   ```bash
   node setup-bot.js
   ```

## 🔧 Шаг 3: Настройка токена в приложении

1. **Откройте `backend/config.env`**
2. **Замените строку:**
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```
   **На:**
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

3. **Переразверните backend на Railway**

## ✅ Шаг 4: Проверка

1. **Найдите вашего бота в Telegram**
2. **Нажмите кнопку "Открыть TON Market"**
3. **Приложение должно открыться в Telegram WebApp**

## 🎯 Результат

После настройки у вас будет:
- ✅ Telegram бот с кнопкой WebApp
- ✅ Приложение, которое открывается в Telegram
- ✅ Полная функциональность для реальных пользователей

## 🔗 Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp](https://core.telegram.org/bots/webapps)
- [@BotFather](https://t.me/botfather) 