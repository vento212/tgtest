#!/bin/bash

echo "🚀 Начинаем деплой на Netlify..."

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
echo ""
echo "📤 Теперь загрузите папку 'build' на Netlify:"
echo "1. Откройте https://netlify.com"
echo "2. Нажмите 'Sign up' (через GitHub)"
echo "3. Нажмите 'Add new site' → 'Deploy manually'"
echo "4. Перетащите папку 'build' в область загрузки"
echo "5. Дождитесь загрузки (1-2 минуты)"
echo ""
echo "🌐 После деплоя вы получите URL вида: https://your-app-name.netlify.app"
echo ""
echo "💡 Альтернативно, можно подключить GitHub репозиторий для автоматического деплоя" 