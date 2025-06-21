#!/bin/bash

# Скрипт для запуска MongoDB

echo "🚀 Запуск MongoDB..."

# Создаем директорию для данных если её нет
mkdir -p ~/data/db

# Запускаем MongoDB
./mongodb-macos-x86_64-7.0.21/bin/mongod --dbpath ~/data/db

echo "✅ MongoDB запущен на порту 27017" 