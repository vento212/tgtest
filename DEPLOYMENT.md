# 🚀 Развертывание на Netlify

## Автоматическое развертывание

1. **Подключите репозиторий к Netlify:**
   - Зайдите на [netlify.com](https://netlify.com)
   - Нажмите "New site from Git"
   - Выберите GitHub и ваш репозиторий `tgtest`
   - Настройки сборки уже настроены в `netlify.toml`

2. **Настройте переменные окружения в Netlify:**
   - В настройках сайта перейдите в "Environment variables"
   - Добавьте следующие переменные:
     ```
     REACT_APP_TON_WALLET_ADDRESS=EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G
     REACT_APP_TONCENTER_API_KEY=your_toncenter_api_key_here
     ```

3. **Деплой:**
   - Netlify автоматически соберет и развернет приложение
   - Каждый push в main ветку будет автоматически деплоиться

## Ручное развертывание

```bash
# Установка зависимостей
npm install

# Сборка для продакшена
npm run build

# Загрузка на Netlify (если у вас установлен Netlify CLI)
netlify deploy --prod --dir=build
```

## Настройка домена

1. В настройках Netlify перейдите в "Domain settings"
2. Добавьте ваш кастомный домен
3. Настройте SSL сертификат (автоматически)

## Проверка работы

После деплоя проверьте:
- ✅ Приложение загружается без ошибок
- ✅ Ton Connect подключается
- ✅ Платежные ссылки работают
- ✅ API ключ TON Center настроен

## Troubleshooting

### Ошибки сборки
- Проверьте, что все зависимости установлены
- Убедитесь, что Node.js версии 18+

### Проблемы с Ton Connect
- Проверьте, что `tonconnect-manifest.json` доступен по URL
- Убедитесь, что домен добавлен в настройки Ton Connect

### Проблемы с API
- Проверьте переменные окружения в Netlify
- Убедитесь, что API ключ TON Center действителен 