# ⚡ Быстрый деплой

## Вариант 1: Автоматический деплой (Рекомендуется)

1. **Зайдите на [netlify.com](https://netlify.com)**
2. **Нажмите "New site from Git"**
3. **Выберите GitHub → tgtest**
4. **Настройки:**
   - Build command: `npm run build`
   - Publish directory: `build`
5. **Нажмите "Deploy site"**

## Вариант 2: Через скрипт

```bash
# Запустите скрипт деплоя
./deploy.sh
```

## Вариант 3: Ручной деплой

```bash
# Сборка
npm run build

# Установка Netlify CLI
npm install -g netlify-cli

# Деплой
netlify deploy --prod --dir=build
```

## После деплоя

1. **Настройте переменные окружения в Netlify:**
   ```
   REACT_APP_TON_WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
   REACT_APP_TONCENTER_API_KEY=your_api_key_here
   ```

2. **Получите API ключ TON Center:**
   - Зарегистрируйтесь на [toncenter.com](https://toncenter.com)
   - Получите API ключ в личном кабинете

3. **Добавьте домен в Ton Connect:**
   - Зайдите в [Ton Connect Dashboard](https://app.tonconnect.org/)
   - Добавьте ваш домен

## Готово! 🎉

Ваше приложение будет доступно по адресу:
`https://your-app-name.netlify.app` 