Я изучу архитектуру вашего проекта Martyrs и доработаю ТЗ с учетом существующей кодовой базы. Сначала найду информацию об organizations, departments и общей архитектуре.## ТЗ: модуль управления проектами OZ DAO (доработка с учетом архитектуры Martyrs)

### Назначение
Модуль обеспечивает управление проектами с интеграцией в экосистему Martyrs: проекты с несколькими репозиториями, задачи (по умолчанию приватные для участников), merge requests, ревью и утверждение, выплаты исполнителям на внутренние кошельки, GitOps-раздел. Использует существующую инфраструктуру авторизации, организаций и ролей.

### Архитектурная интеграция

**Базовые модели и связи:**
- Расширение `db.organization` через связь с `db.project` (owner.type: 'Organization')
- Использование `db.membership` для управления участниками проекта с расширенными ролями
- Интеграция с `db.department` для привязки проектов к подразделениям
- Применение существующей системы `invites` для приглашений в проекты

**Ключевые файлы для просмотра:**
- `modules/organizations/models/membership.model.js` - базовая модель членства
- `modules/organizations/models/schemas/accesses.schema.js` - схема доступов
- `modules/organizations/policies/organizations.policies.js` - политики ABAC
- `modules/organizations/controllers/utils/queryProcessorOrganizations.js` - обработка запросов
- `modules/globals/controllers/classes/abac/` - система контроля доступа

### Основной поток
Создание проекта в организации → назначение department (опционально) → приглашение участников через invites → добавление репозиториев → создание задач → выполнение задач → открытие MR с привязкой к задаче → ревью и утверждение → закрытие задачи и приёмка → выплата через wallet модуль.

### Расширение модели Membership для проектов

**Дополнительные поля в membership для контекста проекта:**
```
membership.context = {
  type: 'Project', // или 'Organization', 'Department'
  target: ObjectId // ID проекта
}
membership.projectRole: String // 'owner', 'management', 'contributor'
membership.permissions: {
  merge: Boolean,
  deploy: Boolean,
  budget: Boolean,
  veto: Boolean
}
```

### Роли проекта (через расширенный membership)

- **Owner проекта** — создатель проекта или назначенный владелец из организации
  - Полный контроль через `membership.projectRole === 'owner'`
  - Автоматически получает все permissions: true
  - Наследует права от `organizationHelpers.isOrganizationOwner()`

- **Management проекта** — участники с правами управления
  - `membership.projectRole === 'management'`
  - Настраиваемые permissions через `membership.permissions`
  - По умолчанию: merge, deploy, budget = true; veto = false

- **Contributors проекта** — разработчики и исполнители
  - `membership.projectRole === 'contributor'`
  - Базовые права: создание задач и MR
  - permissions по умолчанию все false

### Интеграция с ABAC системой

**Регистрация политик проекта:**
```
// В modules/projects/policies/projects.policies.js
abacAccessControl.registerResourcePolicy('project', async context => {
  // Использование organizationHelpers для проверки прав
  const orgId = await getProjectOrganization(context.currentResource);
  const isOrgMember = await context.checkOrganizationMember(context.user, orgId);
  // Проверка projectRole через membership
});
```

**Использование field policies для задач:**
```
abac.registerFieldsPolicy('task', {
  'budget': { 
    access: async (context) => context.membership?.permissions?.budget,
    actions: ['update']
  },
  'status': {
    access: async (context) => {
      if (context.value === 'done') {
        return context.membership?.permissions?.merge;
      }
    }
  }
});
```

### Правила действий (через ABAC middleware)

- **Ветки и push** — проверка через `abac.middleware('repository', 'push')`
  - Требует projectRole: owner/management
- **MR создание** — открыто для всех с доступом к задаче
- **Merge** — требует permissions.merge === true
- **Выплаты** — требует permissions.budget === true
- **Deploy/rollback** — требует permissions.deploy === true
- **Наложение вето** — требует permissions.veto === true

### Голосование (microDAO интеграция)

**Структура голосования:**
```
voting: {
  type: 'task' | 'mr' | 'payout' | 'deploy',
  target: ObjectId,
  requires_vote: Boolean,
  voters: [{ 
    user: ObjectId,
    vote: 'approve' | 'reject' | 'veto',
    timestamp: Date
  }],
  threshold: Number, // процент для принятия
  status: 'pending' | 'approved' | 'rejected' | 'vetoed'
}
```

**Интеграция с WebSocket:**
- События голосования транслируются через `WebSocketManager`
- Использование существующих каналов: `project:{id}`, `task:{id}`
- Real-time обновления статусов через `globalswebsocket`

### Задачи (расширение governance/tasks)

**Дополнительные поля для проектных задач:**
```
task.project: ObjectId // связь с проектом
task.repository: String // целевой репозиторий
task.branch: String // целевая ветка
task.mergeRequests: [ObjectId] // связанные MR
task.visibility: {
  type: String, // 'project', 'public', 'custom'
  allowList: [ObjectId], // для custom
  denyList: [ObjectId]
}
task.budget: {
  amount: Number,
  currency: String,
  approved: Boolean
}
task.passed: Boolean // флаг приёмки
```

### События и уведомления

**Использование notifications модуля:**
- Подключение к `modules/notifications/` для email/push уведомлений
- События проекта регистрируются через Observer pattern
- Логирование через `globals.logger` с категорией 'project'

**WebSocket события:**
```javascript
// Используя WebSocketManager из globals
wss.broadcast(`project:${projectId}`, {
  event: 'task.updated',
  data: taskData,
  permissions: ['project.member'] // фильтрация по правам
});
```

### Инварианты и валидация

- **Owner контроль** — проверка через `organizationHelpers.isOrganizationOwner()` или `membership.projectRole === 'owner'`
- **Cascade permissions** — права организации наследуются проектом
- **Atomic operations** — использование транзакций MongoDB для критичных операций
- **Audit trail** — логирование всех действий через `db.log`
- **Cache invalidation** — сброс кеша при изменении прав через `Cache` из globals

### Таблица ролей и разрешений

| Действие | Owner | Management | Contributor | Условия |
|----------|-------|------------|-------------|---------|
| Создание проекта | ✓ | ✗ | ✗ | Требует прав в организации |
| Управление участниками | ✓ | ✗ | ✗ | - |
| Создание задач | ✓ | ✓ | ✓ | - |
| Создание MR | ✓ | ✓ | ✓ | Доступ к задаче |
| Merge в main | ✓ | ✓* | ✗ | *При permissions.merge |
| Назначение бюджета | ✓ | ✓* | ✗ | *При permissions.budget |
| Инициация выплат | ✓ | ✓* | ✗ | *При permissions.budget |
| Deploy | ✓ | ✓* | ✗ | *При permissions.deploy |
| Наложение вето | ✓ | ✓* | ✗ | *При permissions.veto |
| Снятие вето | ✓ | ✗ | ✗ | Только owner |
| Удаление проекта | ✓ | ✗ | ✗ | - |

### Интеграция с существующими модулями

- **auth** — использование `auth.state.user` для текущего пользователя
- **wallet** — интеграция для выплат через внутренние кошельки
- **notifications** — уведомления о событиях проекта
- **globals/cache** — кеширование прав доступа
- **globals/logger** — аудит всех действий
- **organizations** — наследование структуры и прав

Этот подход максимально использует существующую инфраструктуру Martyrs, минимизируя дублирование кода и обеспечивая консистентность с остальной системой.