# 3D Portfolio

Современное интерактивное портфолио с 3D-визуализацией проектов, полноценной админ-панелью и медиагалереей.

## 🚀 Особенности

### Frontend
- **3D Карусель проектов** с интерактивной навигацией (скролл, клавиши)
- **Адаптивный дизайн** в стиле unveil.fr
- **Медиагалерея** с поддержкой изображений, видео и GIF
- **Полноэкранный просмотр** медиафайлов с Range-запросами для видео
- **Оптимизированный скролл** для Mac тачпада
- **Система категорий** и фильтрация проектов
- **Кастомный курсор** для 3D-сцены

### Backend
- **Админ-панель** для управления проектами и настройками
- **Медиа-прокси** через бэкенд с CORS поддержкой
- **JWT авторизация** с refresh tokens
- **Валидация данных** через Zod
- **Graceful error handling** и загрузка

### Storage
- **MinIO** для медиафайлов с публичным доступом
- **LowDB** для данных с автоматической миграцией
- **Docker** полная контейнеризация

## 🛠 Технологии

### Frontend
- React 18 + TypeScript
- Three.js + React Three Fiber
- Tailwind CSS + Framer Motion
- React Query + React Hook Form
- Zod для валидации

### Backend
- Node.js + Express.js
- LowDB (JSON database)
- MinIO (S3-совместимое хранилище)
- JWT + bcryptjs
- Multer для загрузки файлов

### DevOps
- Docker + Docker Compose
- Nginx для фронтенда
- Health checks и graceful shutdown
- Hot reload в разработке

## 📦 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd 3d-portfolio
```

### 2. Настройка окружения
Создайте файл `.env` в корне проекта:

```env
# Backend settings
API_PORT=8080
JWT_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development

# Admin user
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# MinIO settings - СИНХРОНИЗИРОВАНЫ!
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_ACCESS_KEY=portfolioadmin
MINIO_SECRET_KEY=portfoliosecret123
MINIO_ROOT_USER=portfolioadmin
MINIO_ROOT_PASSWORD=portfoliosecret123
MINIO_BUCKET_NAME=portfolio-files
MINIO_REGION=us-east-1

# Frontend settings
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_MINIO_URL=http://localhost:9000

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

### 3. Запуск с Docker (Рекомендуется)
```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 4. Локальная разработка

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### MinIO (отдельно)
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=portfolioadmin \
  -e MINIO_ROOT_PASSWORD=portfoliosecret123 \
  minio/minio server /data --console-address ":9001"
```

## 🌐 URL-адреса

После запуска доступны следующие сервисы:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MinIO Console**: http://localhost:9001
- **MinIO API**: http://localhost:9000
- **Админ-панель**: http://localhost:3000/admin

### Доступ к админ-панели
- **Логин**: `admin`
- **Пароль**: `admin123`

## 📱 Адаптивность

Проект полностью адаптивен:

- **Desktop (>1024px)**: Полный 3D-интерфейс с большими карточками
- **Tablet (768-1024px)**: Средние карточки с сохранением функциональности
- **Mobile (<768px)**: Компактные карточки, оптимизированная навигация

### Особенности мобильной версии:
- Уменьшенные 3D-карточки проектов
- Адаптивный радиус карусели
- Оптимизированная чувствительность тач-скролла
- Улучшенное позиционирование гамбургер-меню

## 🎮 Навигация

### Основная страница (3D карусель)
- **Скролл мыши/тачпад**: Поворот карусели
- **← → стрелки**: Навигация между проектами
- **Клик на проект**: Переход к детальной странице
- **Фильтры**: Категории проектов в правом верхнем углу

### Медиагалерея
- **Клик на медиа**: Полноэкранный режим
- **← → стрелки**: Навигация в полноэкранном режиме
- **Escape**: Выход из полноэкранного режима
- **Пробел**: Пауза/воспроизведение видео

## 🔧 Структура проекта

```
3d-portfolio/
├── frontend/                  # React приложение
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/           # Three.js компоненты
│   │   │   ├── admin/        # Админ-панель
│   │   │   └── ui/           # UI компоненты
│   │   ├── pages/            # Страницы
│   │   ├── hooks/            # Кастомные хуки
│   │   ├── utils/            # Утилиты и API
│   │   └── styles/           # Стили
│   ├── public/
│   └── Dockerfile
├── backend/                   # Express.js API
│   ├── src/
│   │   ├── routes/           # API роуты
│   │   ├── services/         # Бизнес-логика
│   │   ├── middleware/       # Middleware
│   │   └── utils/
│   ├── data/                 # LowDB данные
│   └── Dockerfile
├── minio/                    # MinIO конфигурация
├── docker-compose.yml       # Docker конфигурация
├── .env.example              # Пример конфигурации
└── README.md
```

## 🗃 База данных

### LowDB Schema
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password": "hash",
      "role": "admin",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "projects": [
    {
      "id": 1,
      "title": "Project Title",
      "description": "Project description",
      "category": "web",
      "technologies": "React, Three.js, Node.js",
      "releaseDate": "2025-01-01T00:00:00.000Z",
      "status": "published",
      "featured": false,
      "sortOrder": 0,
      "mediaFiles": [
        {
          "id": 1,
          "url": "http://localhost:8080/api/media/portfolio-files/images/file.jpg",
          "type": "image",
          "name": "cover.jpg",
          "caption": "Project screenshot"
        }
      ],
      "customButtons": [
        {
          "text": "View Live",
          "url": "https://example.com"
        }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "settings": {
    "studio": {
      "aboutText": "Studio description",
      "clients": ["Client 1", "Client 2"],
      "services": ["Service 1", "Service 2"],
      "recognitions": ["Award 1", "Award 2"]
    },
    "contact": {
      "contactButtons": [
        {
          "text": "Email",
          "url": "mailto:contact@example.com"
        }
      ]
    }
  }
}
```

## 🔐 API Endpoints

### Публичные
- `GET /api/projects` - Список проектов
- `GET /api/projects/:id` - Проект по ID
- `GET /api/projects/categories` - Категории проектов
- `GET /api/settings/studio` - Настройки студии
- `GET /api/settings/contact` - Контактные кнопки
- `GET /api/media/*` - Медиа-прокси

### Админ (требует авторизации)
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/projects` - Создание проекта
- `PUT /api/projects/:id` - Обновление проекта
- `DELETE /api/projects/:id` - Удаление проекта
- `POST /api/upload/image` - Загрузка изображения
- `POST /api/upload/video` - Загрузка видео
- `PUT /api/settings/studio` - Обновление настроек студии
- `PUT /api/settings/contact` - Обновление контактов

## 🎨 Дизайн-система

Проект следует дизайн-принципам **unveil.fr**:

### Цветовая палитра
- **Основной**: `#ffffff` (белый)
- **Акцент**: `#0066ff` (синий), `#00d4aa` (зеленый)
- **Серые**: `#18181b`, `#71717a`, `#d4d4d8`

### Типографика
- **Основной шрифт**: Inter
- **Моноширинный**: SF Mono, Monaco
- **Размеры**: от 10px (кнопки) до 72px (заголовки)

### Анимации
- **Переходы**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **3D эффекты**: стеклянные поверхности, плавные вращения
- **Микроанимации**: hover эффекты, loading состояния

## 🐛 Отладка

### Логи
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f minio
```

### Общие проблемы

1. **CORS ошибки**: Проверьте `CORS_ORIGIN` в `.env`
2. **Медиафайлы не загружаются**: Проверьте MinIO подключение и CORS политику
3. **3D сцена не работает**: Проверьте поддержку WebGL в браузере
4. **Админ-панель недоступна**: Проверьте JWT_SECRET и данные для входа

### MinIO отладка
```bash
# Проверка bucket
docker exec -it 3d-portfolio-minio-1 mc ls local/

# Настройка CORS
docker exec -it 3d-portfolio-minio-1 mc admin config set local cors_allowed_origins="*"
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## ⭐ Благодарности

- [Three.js](https://threejs.org/) - 3D библиотека
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React интеграция Three.js
- [unveil.fr](https://unveil.fr/) - дизайн вдохновение
- [MinIO](https://min.io/) - S3-совместимое хранилище

---

**Версия**: 1.0.0  
**Последнее обновление**: Январь 2025