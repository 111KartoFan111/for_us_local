# 3D Портфолио - Продакшен

## 🚀 Рабочая версия
**Продакшен:** https://forus-production-5ba6.up.railway.app/

## 📋 Админка
- **Ссылка:** https://forus-production-5ba6.up.railway.app/admin/login
- **Логин:** `admin`
- **Пароль:** `your-secure-password-123`

## 🛠 Технологии
- **Фронтенд:** React + Three.js (3D карусель)
- **Бэкенд:** Node.js + Express
- **База данных:** LowDB (JSON файловая)
- **Хранилище:** MinIO (совместимо с S3)
- **Хостинг:** Railway

## ✨ Возможности
- 3D интерактивная карусель проектов
- Админка для управления контентом
- Загрузка медиафайлов через MinIO
- Адаптивный дизайн (мобильный/десктоп)
- Фильтрация проектов в реальном времени

## 🔧 Переменные окружения в продакшене

```bash
# Основные
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-production-key-2025

# Доступ к админке
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-123

# MinIO хранилище
ENABLE_MINIO=true
MINIO_ACCESS_KEY=prodportfolioadmin
MINIO_SECRET_KEY=prod-portfolio-secret-2025
MINIO_BUCKET_NAME=portfolio-files

# URL-ы (домен Railway)
CORS_ORIGIN=https://forus-production-5ba6.up.railway.app
REACT_APP_API_URL=https://forus-production-5ba6.up.railway.app/api
REACT_APP_MINIO_URL=https://forus-production-5ba6.up.railway.app
```

## 📁 Структура проекта
```
3d-portfolio/
├── frontend/          # React приложение с Three.js
├── backend/           # Express API + LowDB
├── start-railway.sh   # Скрипт запуска Railway (MinIO + Node.js)
├── Dockerfile.railway # Мульти-стейдж сборка
└── railway.json       # Конфиг Railway
```

## 🚀 Быстрый старт

### 1. Админка
1. Зайти на `/admin/login`
2. Войти под админом
3. Создать проекты с медиафайлами
4. Настроить студию и контакты

### 2. API эндпоинты
- `GET /api/health` - Проверка работы
- `GET /api/projects` - Все проекты
- `GET /api/projects/categories` - Категории проектов
- `POST /api/auth/login` - Вход в админку

### 3. Основные фичи
- **3D Карусель:** Интерактивная навигация по проектам
- **Загрузка медиа:** Поддержка картинок, видео, GIF
- **Админ панель:** Полное управление контентом
- **Мобильная версия:** Оптимизировано для всех устройств

## 🔄 Процесс деплоя

1. **Деплой на Railway:**
   - Git push запускает автодеплой
   - Мульти-стейдж Docker сборка
   - MinIO запускается автоматически
   - React отдается как статика

2. **Архитектура:**
   ```
   Railway Контейнер:
   ├── MinIO Сервер (порт 9000)
   ├── Node.js API (порт 8080)
   └── React Статика (/public)
   ```

## 🆘 Решение проблем

### Частые проблемы:
1. **CORS ошибки:** Проверить `CORS_ORIGIN` совпадает с доменом
2. **Загрузка медиа не работает:** Проверить MinIO запущен (`ENABLE_MINIO=true`)
3. **React не загружается:** Проверить переменные сборки (`REACT_APP_*`)

### Проверки работоспособности:
- **API:** `/api/health` должен вернуть `{"status":"OK"}`
- **MinIO:** Загрузка медиа работает в админке
- **Фронтенд:** 3D сцена загружается без ошибок

## 📊 Текущий статус
- ✅ Продакшен развернут на Railway
- ✅ MinIO хранилище работает
- ✅ Админка функционирует
- ✅ 3D карусель работает
- ✅ Мобильная версия адаптирована

---

**Последнее обновление:** Август 2025  
**Версия:** 1.0.0 Продакшен