# AeroSales Frontend

Фронтенд приложения для системы продажи авиабилетов на Vue.js 3 + Vite.

## Установка и запуск

### 1. Установка зависимостей
```bash
cd front
npm install
```

### 2. Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Настройка для разработки

1. Убедитесь, что backend запущен на порту 3000
2. Frontend запускается на порту 5173

## Переменные окружения

Создайте файл `.env` для настройки:

```env
VITE_API_URL=http://localhost:3000/api
VITE_UPLOADS_URL=http://localhost:3000/uploads
```

