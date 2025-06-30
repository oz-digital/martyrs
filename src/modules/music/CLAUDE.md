# CLAUDE.md - Справочник для разработки

## 🎵 Music Module - Типы и схемы данных

### **Track Model (`db.track`)**
```javascript
{
  title: String, // required, trim
  artist: ObjectId, // required, ref: 'Artist'
  album: ObjectId, // optional, ref: 'Album'
  duration: Number, // default: 0 (в секундах)
  fileUrl: String, // required (URL аудиофайла)
  coverUrl: String, // optional (URL обложки)
  genre: [ObjectId], // массив, ref: 'Genre'
  releaseDate: Date, // default: Date.now
  isExplicit: Boolean, // default: false
  lyrics: String, // optional (текст песни)
  playCount: Number, // default: 0
  isPublic: Boolean, // default: true
  
  // Из общих схем:
  url: String, // SEO-friendly URL (auto-generated)
  status: String, // 'draft' | 'published' | 'archived'
  owner: { type: String, target: ObjectId }, // владелец
  metadata: Object, // дополнительные данные
  engagement: Object, // лайки, просмотры и т.д.
  createdAt: Date,
  updatedAt: Date
}
```

### **Artist Model (`db.artist`)**
```javascript
{
  name: String, // required, trim
  bio: String, // optional, trim
  photoUrl: String, // optional (URL фото)
  coverUrl: String, // optional (URL обложки)
  genre: [ObjectId], // массив, ref: 'Genre'
  isVerified: Boolean, // default: false (верифицированный артист)
  website: String, // optional, trim
  location: String, // optional, trim
  popularity: Number, // default: 0 (рейтинг популярности)
  
  // Из общих схем:
  url: String, // SEO-friendly URL
  status: String, // 'draft' | 'published' | 'archived'
  owner: { type: String, target: ObjectId },
  metadata: Object,
  socials: Object, // соцсети (Instagram, Twitter и т.д.)
  engagement: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Album Model (`db.album`)**
```javascript
{
  title: String, // required
  description: String, // default: ''
  releaseDate: Date, // required
  coverArt: String, // optional (URL обложки)
  artists: [ObjectId], // required, массив, ref: 'Artist'
  type: String, // enum: ['album', 'single', 'EP', 'compilation'], default: 'album'
  genres: [ObjectId], // массив, ref: 'Genre'
  totalTracks: Number, // default: 0
  
  // Из общих схем:
  url: String,
  status: String,
  owner: { type: String, target: ObjectId },
  metadata: Object,
  engagement: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Playlist Model (`db.playlist`)**
```javascript
{
  title: String, // required, trim
  description: String, // optional, trim
  coverUrl: String, // optional
  tracks: [
    {
      track: ObjectId, // ref: 'Track'
      addedAt: Date // default: Date.now
    }
  ],
  isPublic: Boolean, // default: true
  followers: Number, // default: 0
  isCollaborative: Boolean, // default: false
  collaborators: [ObjectId], // массив, ref: 'User'
  
  // Из общих схем:
  url: String,
  status: String,
  owner: { type: String, target: ObjectId },
  metadata: Object,
  engagement: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Genre Model (`db.genre`)**
```javascript
{
  name: String, // required, trim, unique
  description: String, // optional, trim
  iconUrl: String, // optional (URL иконки)
  popularity: Number, // default: 0
  
  // Из общих схем:
  url: String,
  status: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Play History Model (`db.playHistory`)**
```javascript
{
  user: ObjectId, // ref: 'User'
  track: ObjectId, // ref: 'Track'
  playedAt: Date, // default: Date.now
  duration: Number, // сколько секунд прослушано
  completed: Boolean, // default: false (прослушано до конца)
}
```

## 🔧 Validator API Reference

### **Основные типы:**
- `.string()` - строка
- `.number()` - число (включая float)
- `.integer()` - целое число
- `.boolean()` - булево значение
- `.array()` - массив
- `.date()` - дата (Date object или ISO string)

### **Валидация:**
- `.required('message')` - обязательное поле
- `.min(value, 'message')` - минимальное значение/length
- `.max(value, 'message')` - максимальное значение/length
- `.pattern(regex, 'message')` - регулярное выражение
- `.oneOf([values], 'message')` - одно из значений
- `.email('message')` - email формат

### **Массивы и объекты:**
- `.items(validator)` - валидация элементов массива
- `.object(schema)` - валидация объекта по схеме

### **НЕ существующие методы:**
- ❌ `.trim()` - НЕТ такого метода
- ❌ `.optional()` - НЕТ такого метода (по умолчанию поля опциональные)

## 🛡️ Verifier API Reference

### **Структура Verifier:**
```javascript
const verifier = new Verifier({
  fieldName: {
    rule: 'required' | 'optional' | 'forbidden' | function,
    default: any, // значение по умолчанию
    validator: Validator.schema()... // валидатор
  }
});
```

### **Правила (rule):**
- `'required'` - поле обязательно
- `'optional'` - поле опционально (по умолчанию)
- `'forbidden'` - поле запрещено
- `function(context)` - функция для динамической проверки

## 🚀 CRUD API Reference

### **Базовая структура CRUD:**
```javascript
const crud = new CRUD({
  app,
  db,
  model: db.modelName,
  modelName: 'modelName',
  basePath: '/api/endpoint',
  
  auth: true, // требует авторизации
  
  verifiers: {
    create: verifier.createVerifier,
    read: verifier.readVerifier,
    update: verifier.updateVerifier,
    delete: verifier.deleteVerifier
  },
  
  abac: abac, // ABAC instance
  
  cache: {
    enabled: true,
    ttl: 300,
    tags: ['tag1', 'tag2']
  },
  
  events: {
    enabled: true,
    logReads: false
  }
});
```

### **Добавление кастомных действий:**
```javascript
crud.addAction('actionName', {
  method: 'get' | 'post' | 'put' | 'delete',
  path: '/custom-path',
  auth: true | false,
  abac: {
    resource: 'resourceName',
    action: 'actionName',
    strict: true
  },
  handler: async (req, res) => {
    // кастомная логика
  }
});
```

## 📡 API Endpoints (автоматически созданные)

### **Tracks (`/api/tracks`)**
- `POST /api/tracks/create` - создать трек
- `GET /api/tracks/read` - список треков
- `PUT /api/tracks/update` - обновить трек
- `DELETE /api/tracks/delete` - удалить трек
- `GET /api/tracks/url/:url` - трек по URL
- `GET /api/tracks/recent` - недавние треки
- `GET /api/tracks/popular` - популярные треки
- `GET /api/tracks/genre/:genreId` - треки по жанру

### **Artists (`/api/artists`)**
- Базовые CRUD + дополнительные:
- `GET /api/artists/url/:url` - артист по URL
- `GET /api/artists/:artistId/discography` - дискография
- `PUT /api/artists/:artistId/verify` - верифицировать (admin)
- `GET /api/artists/:artistId/related` - похожие артисты

### **Albums (`/api/albums`)**
- Базовые CRUD + дополнительные:
- `GET /api/albums/url/:url` - альбом по URL
- `GET /api/albums/:albumId/tracks` - треки альбома
- `GET /api/albums/featured` - рекомендуемые альбомы

### **Playlists (`/api/playlists`)**
- Базовые CRUD + дополнительные:
- `GET /api/playlists/url/:url` - плейлист по URL
- `GET /api/playlists/user/:userId?` - плейлисты пользователя
- `POST /api/playlists/:playlistId/tracks/:trackId` - добавить трек
- `DELETE /api/playlists/:playlistId/tracks/:trackId` - удалить трек
- `POST /api/playlists/:playlistId/collaborators/:userId` - добавить коллаборатора

### **Genres (`/api/genres`)**
- Базовые CRUD + дополнительные:
- `GET /api/genres/url/:url` - жанр по URL
- `GET /api/genres/:genreId/tracks` - треки жанра
- `GET /api/genres/popular` - популярные жанры

## 💡 Типичные паттерны валидации

### **ObjectId валидация:**
```javascript
validator: Validator.schema()
  .string()
  .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
```

### **URL валидация:**
```javascript
validator: Validator.schema()
  .string()
  .pattern(/^https?:\/\/.+/, 'Invalid URL format')
```

### **Массив ObjectId:**
```javascript
validator: Validator.schema()
  .array()
  .items(
    Validator.schema()
      .string()
      .pattern(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
  )
```

### **Объект с вложенной валидацией:**
```javascript
validator: Validator.schema().object({
  type: Validator.schema().string().oneOf(['user', 'organization']),
  target: Validator.schema().string().pattern(/^[0-9a-fA-F]{24}$/)
})
```

### **Статусы:**
```javascript
validator: Validator.schema()
  .string()
  .oneOf(['draft', 'published', 'archived'], 'Invalid status')
```