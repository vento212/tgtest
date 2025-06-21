# 🔧 Устранение неполадок

## Предупреждения в консоли

### Source Map Warnings
Если вы видите предупреждения типа:
```
WARNING in ./node_modules/@tonconnect/ui/node_modules/@tonconnect/sdk/lib/esm/index.mjs
Module Warning (from ./node_modules/source-map-loader/dist/cjs.js):
Failed to parse source map from '...' file: Error: ENOENT: no such file or directory
```

**Решение:**
1. Убедитесь, что в `env.local` установлено:
   ```
   GENERATE_SOURCEMAP=false
   ```

2. Проверьте, что используется CRACO (см. `craco.config.js`)

3. Перезапустите приложение:
   ```bash
   npm start
   ```

### Порт уже используется
Если видите ошибку:
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Решение:**
1. Остановите все процессы на порту 3001:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. Или измените порт в `backend/server.js`:
   ```javascript
   const PORT = process.env.PORT || 3002;
   ```

## Проблемы с Ton Connect

### Кошелек не подключается
1. Проверьте, что `tonconnect-manifest.json` доступен по URL
2. Убедитесь, что домен добавлен в настройки Ton Connect
3. Проверьте консоль браузера на ошибки

### Ошибки API
1. Проверьте переменные окружения
2. Убедитесь, что API ключ TON Center действителен
3. Проверьте сетевые запросы в DevTools

## Проблемы сборки

### Ошибки памяти
Если видите ошибки типа "JavaScript heap out of memory":

**Решение:**
1. Увеличьте лимит памяти:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm start
   ```

2. Или используйте готовую настройку в `package.json`:
   ```json
   "build": "GENERATE_SOURCEMAP=false NODE_OPTIONS=--max_old_space_size=4096 craco build"
   ```

### Ошибки зависимостей
1. Удалите `node_modules` и `package-lock.json`
2. Переустановите зависимости:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Проблемы с MongoDB

### MongoDB не запускается
1. Проверьте, что порт 27017 свободен
2. Убедитесь, что у вас есть права на создание директории данных
3. Запустите MongoDB вручную:
   ```bash
   ./start-mongodb.sh
   ```

### Ошибки подключения
1. Проверьте строку подключения в `backend/config.env`
2. Убедитесь, что MongoDB запущен
3. Проверьте логи MongoDB

## Общие решения

### Очистка кэша
```bash
# Очистка npm кэша
npm cache clean --force

# Очистка React кэша
rm -rf build/
rm -rf .cache/
```

### Перезапуск всех сервисов
```bash
# Остановка всех процессов
pkill -f "node\|npm\|craco"

# Перезапуск
npm start
```

### Проверка версий
```bash
# Проверка версии Node.js
node --version

# Проверка версии npm
npm --version

# Проверка установленных пакетов
npm list --depth=0
``` 