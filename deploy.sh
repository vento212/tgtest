#!/bin/bash

echo "🚀 Начинаем автоматический деплой на Netlify..."

# Останавливаем все процессы
echo "📋 Останавливаем процессы..."
pkill -f "node\|npm\|react-scripts" > /dev/null 2>&1 || true

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

# Проверяем, что сборка прошла успешно
if [ ! -d "build" ]; then
    echo "❌ Ошибка: папка build не создана"
    exit 1
fi

echo "✅ Сборка завершена успешно!"

# Проверяем, авторизован ли пользователь в Netlify
if ! netlify status > /dev/null 2>&1; then
    echo "🔐 Авторизация в Netlify..."
    echo "📝 Следуйте инструкциям в браузере для авторизации"
    netlify login
fi

# Деплоим на Netlify
echo "🌐 Деплоим на Netlify..."
netlify deploy --prod --dir=build

echo ""
echo "🎉 Деплой завершен!"
echo "📝 Не забудьте:"
echo "   1. Настроить переменные окружения в Netlify Dashboard"
echo "   2. Добавить домен в Ton Connect Dashboard"
echo "   3. Получить API ключ TON Center" 