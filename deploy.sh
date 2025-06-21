#!/bin/bash

echo "🚀 Начинаем деплой на Netlify..."

# Остановка всех процессов
echo "⏹️ Останавливаем локальные процессы..."
pkill -f "craco\|react-scripts" || true

# Сборка проекта
echo "🔨 Собираем проект..."
npm run build

# Проверка сборки
if [ ! -d "build" ]; then
    echo "❌ Ошибка сборки! Папка build не найдена."
    exit 1
fi

echo "✅ Сборка завершена успешно!"

# Проверка наличия Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "📦 Устанавливаем Netlify CLI..."
    npm install -g netlify-cli
fi

# Деплой на Netlify
echo "🌐 Деплоим на Netlify..."
netlify deploy --prod --dir=build

echo "🎉 Деплой завершен!"
echo "📝 Не забудьте:"
echo "   1. Настроить переменные окружения в Netlify"
echo "   2. Добавить домен в Ton Connect Dashboard"
echo "   3. Получить API ключ TON Center" 