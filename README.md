# 🌟 3D Portfolio - Современное интерактивное портфолио

Полнофункциональное портфолио с 3D визуализациями, построенное на React, Three.js и Node.js с админ-панелью для управления контентом.

## ✨ Основные возможности

### 🎨 Frontend
- **3D интерфейс** с Three.js и React Three Fiber
- **Интерактивные проекты** в виде 3D карточек
- **GSAP анимации** для плавных переходов
- **Адаптивный дизайн** для всех устройств
- **Темная тема** с градиентами и эффектами
- **Поиск и фильтрация** проектов

### 🔧 Backend
- **RESTful API** на Express.js
- **JWT авторизация** с refresh токенами
- **Загрузка файлов** через MinIO (S3-совместимое хранилище)
- **LowDB** для хранения данных в JSON
- **Валидация** с Zod схемами

### 🛡️ Админ-панель
- **Защищенная админка** с аутентификацией
- **CRUD операции** для проектов
- **Drag & Drop загрузка** изображений
- **Настройки сайта** и социальных сетей
- **Статистика** и аналитика

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)

### 1. Клонирование и настройка
```bash
# Клонируйте репозиторий
git clone <repository-url>
cd portfolio-3d

# Настройте окружение
cp .env.example .env
# Отредактируйте .env при необходимости
```

### 2. Запуск с Docker
```bash
# Запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build
```

### 3. Доступы
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MinIO Console**: http://localhost:9001 (admin/admin123)
- **Админка**: http://localhost:3000/admin (admin/admin123)

## 📁 Структура проекта

```
portfolio-3d/
├── frontend/               # React приложение
│   ├── public/            # Статические файлы
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   │   ├── 3d/       # Three.js компоненты
│   │   │   ├── ui/       # UI компоненты
│   │   │   └── admin/    # Админ компоненты
│   │   ├── pages/        # Страницы приложения
│   │   ├── context/      # React Context
│   │   ├── hooks/        # Кастомные хуки
│   │   └── utils/        # Утилиты и API
│   ├── Dockerfile        # Docker конфигурация
│   ├── nginx.conf        # Nginx настройки
│   └── package.json      # Зависимости
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/       # API маршруты
│   │   ├── middleware/   # Middleware функции
│   │   └── services/     # Бизнес логика
│   ├── data/             # База данных LowDB
│   ├── Dockerfile        # Docker конфигурация
│   └── package.json      # Зависимости
├── minio/                # MinIO хранилище
├── backup/               # Автоматические бэкапы
├── docker-compose.yml    # Docker Compose конфигурация
└── .env                  # Переменные окружения
```

## 🎯 API Эндпоинты

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/logout` - Выход

### Проекты
- `GET /api/projects` - Список проектов (публичный)
- `GET /api/projects/:id` - Проект по ID
- `GET /api/projects/admin/all` - Все проекты (админ)
- `POST /api/projects` - Создать проект (админ)
- `PUT /api/projects/:id` - Обновить проект (админ)
- `DELETE /api/projects/:id` - Удалить проект (админ)

### Загрузка файлов
- `POST /api/upload/image` - Загрузить изображение (админ)
- `POST /api/upload/document` - Загрузить документ (админ)
- `POST /api/upload/multiple` - Множественная загрузка (админ)
- `DELETE /api/upload/:fileName` - Удалить файл (админ)

## 🛠 Локальная разработка

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### MinIO (отдельно)
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  minio/minio server /data --console-address ":9001"
```

## 🎨 Технологический стек

### Frontend
- **React 18** - UI библиотека
- **Three.js** - 3D графика
- **@react-three/fiber** - React интеграция для Three.js
- **@react-three/drei** - Полезные компоненты для Three.js
- **GSAP** - Анимации
- **Framer Motion** - React анимации
- **Tailwind CSS** - Стилизация
- **React Hook Form** - Формы
- **React Query** - Управление состоянием сервера
- **Zustand** - Глобальное состояние
- **Zod** - Валидация схем

### Backend
- **Node.js** - Среда выполнения
- **Express.js** - Веб фреймворк
- **LowDB** - JSON база данных
- **MinIO** - S3-совместимое хранилище
- **JWT** - Аутентификация
- **Bcrypt** - Хеширование паролей
- **Multer** - Загрузка файлов
- **Helmet** - Безопасность
- **CORS** - Cross-origin запросы

### DevOps
- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация
- **Nginx** - Веб сервер
- **Nodemon** - Автоперезагрузка

## 📋 Полезные команды

### Docker команды
```bash
# Остановить все сервисы
docker-compose down

# Пересобрать и запустить
docker-compose up --build

# Посмотреть логи
docker-compose logs -f [service_name]

# Войти в контейнер
docker-compose exec backend bash
docker-compose exec frontend bash

# Очистить все данные
docker-compose down -v
docker system prune -a
```

### Управление данными
```bash
# Создать бэкап базы данных
tar -czf backup_$(date +%Y%m%d).tar.gz backend/data/

# Восстановить из бэкапа
tar -xzf backup_20241201.tar.gz

# Очистить загруженные файлы
rm -rf minio/data/*
```

## 🔧 Настройка окружения

Основные переменные в `.env`:

```bash
# API настройки
API_PORT=8080
JWT_SECRET=your-secret-key

# MinIO настройки
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=portfolio-files

# Админ пользователь
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Frontend
REACT_APP_API_URL=http://localhost:8080/api
```

## 🚨 Troubleshooting

### Порты заняты
```bash
# Проверить занятые порты
lsof -i :3000,8080,9000,9001

# Изменить порты в docker-compose.yml
```

### Проблемы с MinIO
```bash
# Пересоздать MinIO
docker-compose down
rm -rf minio/data
docker-compose up minio
```

### Ошибки базы данных
```bash
# Пересоздать базу данных
rm backend/data/db.json
docker-compose restart backend
```

## 📈 Производительность

### Оптимизация 3D сцены
- Используйте `useMemo` для тяжелых вычислений
- Ограничивайте количество объектов в сцене
- Применяйте LOD (Level of Detail) для дальних объектов
- Используйте `React.memo` для статических компонентов

### Оптимизация изображений
- WebP формат для современных браузеров
- Lazy loading для изображений
- Responsive изображения с `srcset`
- Сжатие через MinIO

## 🔒 Безопасность

- JWT токены с коротким временем жизни
- Refresh токены для продления сессии
- CORS настройки для ограничения доменов
- Валидация всех входящих данных
- Rate limiting для API эндпоинтов
- Helmet для HTTP заголовков безопасности

## 📝 Лицензия

MIT License - смотрите файл [LICENSE](LICENSE) для деталей.

## 🤝 Вклад в проект

1. Форкните проект
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

- Создайте [Issue](https://github.com/user/portfolio-3d/issues)
- Напишите на email: contact@portfolio.com
- Telegram: @portfolio_dev

---

Сделано с ❤️ и ☕ для создания впечатляющих портфолио