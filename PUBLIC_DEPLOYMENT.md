# 🌐 Публичное развертывание

## Варианты развертывания

### 1. Netlify (Рекомендуется) ⭐

**Преимущества:**
- Бесплатный хостинг
- Автоматический деплой из GitHub
- SSL сертификат включен
- CDN по всему миру

**Шаги:**
1. Зайдите на [netlify.com](https://netlify.com)
2. Нажмите "New site from Git"
3. Выберите GitHub и ваш репозиторий `tgtest`
4. Настройки сборки:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Нажмите "Deploy site"

**Настройка переменных окружения:**
1. В настройках сайта → Environment variables
2. Добавьте:
   ```
   REACT_APP_TON_WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
   REACT_APP_TONCENTER_API_KEY=your_toncenter_api_key_here
   ```

### 2. Vercel

**Шаги:**
1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Vercel автоматически определит настройки
4. Настройте переменные окружения

### 3. GitHub Pages

**Шаги:**
1. В настройках репозитория → Pages
2. Source: Deploy from a branch
3. Branch: main, folder: / (root)
4. Добавьте в `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/tgtest"
   ```

## Настройка Ton Connect для публичного домена

### 1. Получите публичный URL
После деплоя на Netlify/Vercel вы получите URL вида:
- `https://your-app-name.netlify.app`
- `https://your-app-name.vercel.app`

### 2. Обновите tonconnect-manifest.json
```json
{
  "url": "https://your-app-name.netlify.app",
  "name": "TON Payment App",
  "iconUrl": "https://your-app-name.netlify.app/icon.png"
}
```

### 3. Добавьте домен в Ton Connect
1. Зайдите в [Ton Connect Dashboard](https://app.tonconnect.org/)
2. Добавьте ваш домен в список разрешенных

## Настройка API ключа TON Center

### 1. Получите API ключ
1. Зарегистрируйтесь на [toncenter.com](https://toncenter.com)
2. Получите API ключ в личном кабинете

### 2. Добавьте в переменные окружения
```
REACT_APP_TONCENTER_API_KEY=your_api_key_here
```

## Проверка работы

После деплоя проверьте:

### ✅ Основной функционал
- [ ] Приложение загружается
- [ ] Ton Connect подключается
- [ ] Создаются платежные ссылки
- [ ] Копируется адрес кошелька

### ✅ Платежи
- [ ] Deeplink открывает TON кошелек
- [ ] Кнопка "I paid" проверяет статус
- [ ] API запросы работают

### ✅ Безопасность
- [ ] HTTPS включен
- [ ] Переменные окружения скрыты
- [ ] Нет ошибок в консоли

## Локальное тестирование перед деплоем

```bash
# Сборка для продакшена
npm run build

# Локальный сервер для тестирования
npx serve -s build

# Проверка на http://localhost:3000
```

## Troubleshooting

### Проблемы с Ton Connect
- Убедитесь, что домен добавлен в Ton Connect Dashboard
- Проверьте, что `tonconnect-manifest.json` доступен по URL
- Проверьте консоль браузера на ошибки

### Проблемы с API
- Проверьте переменные окружения
- Убедитесь, что API ключ действителен
- Проверьте сетевые запросы в DevTools

### Проблемы сборки
- Проверьте логи сборки
- Убедитесь, что все зависимости установлены
- Проверьте, что нет ошибок в коде

## Мониторинг

### Netlify Analytics
- Просмотр посещений
- Производительность
- Ошибки

### Vercel Analytics
- Аналитика в реальном времени
- Производительность
- Ошибки

## Обновления

После изменения кода:
1. Закоммитьте изменения
2. Запушьте в GitHub
3. Netlify/Vercel автоматически пересоберет и развернет

## Домен

### Кастомный домен
1. Купите домен (например, на Namecheap, GoDaddy)
2. В настройках Netlify/Vercel добавьте кастомный домен
3. Настройте DNS записи
4. SSL сертификат будет выдан автоматически

### Поддомен
- `app.yourdomain.com`
- `ton.yourdomain.com`
- `pay.yourdomain.com` 