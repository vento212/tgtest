#!/bin/bash

echo "🆓 Настройка MongoDB Atlas (Бесплатно)"
echo "======================================"

echo ""
echo "📋 Инструкция по настройке:"
echo "1. Перейдите на https://www.mongodb.com/atlas"
echo "2. Нажмите 'Try Free'"
echo "3. Создайте аккаунт"
echo ""
echo "🔧 Создание кластера:"
echo "1. Выберите план 'FREE' (M0)"
echo "2. Выберите провайдера (AWS/Google Cloud/Azure)"
echo "3. Выберите регион (Frankfurt или ближайший)"
echo "4. Нажмите 'Create'"
echo ""
echo "🔐 Настройка безопасности:"
echo "1. Database Access → Add New Database User"
echo "   - Username: admin"
echo "   - Password: ваш_пароль_123"
echo "   - Role: Atlas admin"
echo ""
echo "2. Network Access → Add IP Address"
echo "   - Нажмите 'Allow Access from Anywhere' (0.0.0.0/0)"
echo ""
echo "🔗 Получение строки подключения:"
echo "1. Нажмите 'Connect'"
echo "2. Выберите 'Connect your application'"
echo "3. Скопируйте строку подключения"
echo ""
echo "⚙️ Обновите следующие файлы:"
echo "- backend/config.env (MONGODB_ATLAS_URI)"
echo "- netlify.toml (REACT_APP_MONGODB_ATLAS_URI)"
echo ""
echo "🚀 После настройки запустите:"
echo "npm run build"
echo "git add ."
echo "git commit -m 'Add MongoDB Atlas configuration'"
echo "git push"
echo ""
echo "✅ Готово! Ваше приложение будет использовать MongoDB Atlas" 