#!/bin/bash

echo "🚀 Настройка MongoDB Atlas для TON Payment App"
echo "================================================"

echo ""
echo "📋 Шаги для создания MongoDB Atlas:"
echo "1. Перейдите на https://www.mongodb.com/atlas"
echo "2. Создайте бесплатный аккаунт"
echo "3. Создайте новый кластер (M0 - Free tier)"
echo "4. Создайте базу данных 'ton-payment-app'"
echo "5. Создайте пользователя с правами read/write"
echo "6. Получите строку подключения"
echo ""

echo "🔧 После получения строки подключения:"
echo "1. Замените 'your_username' и 'your_password' в backend/config.env"
echo "2. Замените 'cluster0.xxxxx.mongodb.net' на ваш кластер"
echo ""

echo "🌐 Настройка доступа:"
echo "1. В MongoDB Atlas перейдите в 'Network Access'"
echo "2. Добавьте IP адрес: 0.0.0.0/0 (разрешить всем)"
echo ""

echo "✅ После настройки запустите:"
echo "cd backend && npm run dev"
echo ""

echo "🔗 Строка подключения должна выглядеть так:"
echo "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ton-payment-app?retryWrites=true&w=majority"
echo ""

read -p "Нажмите Enter, когда создадите MongoDB Atlas..."
echo "🎉 Готово! Теперь у вас есть облачная база данных!" 