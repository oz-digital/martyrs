# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Module Overview

The organizations module is a Vue.js/Node.js module that manages organizations, departments, memberships, and invites within the Martyrs application. It follows a modular architecture with separate client and server components.

## Architecture

### Server-Side Structure
- **Entry Point**: `organizations.server.js` - Initializes models, routes, and policies
- **Models**: Mongoose schemas for Organization, Department, Membership, and Invite
- **Controllers**: Handle business logic with caching support using a custom Cache class
- **Routes**: Express routes for RESTful API endpoints
- **Middlewares**: Access verification middleware
- **Policies**: ABAC (Attribute-Based Access Control) policies

### Client-Side Structure
- **Entry Point**: `organizations.client.js` - Exports components and initializes stores/router
- **Components**: Vue 3 components organized by type:
  - `pages/`: Full page components
  - `forms/`: Popup forms (DepartmentForm, InviteForm, AddExistingMembersForm)
  - `blocks/`: Reusable UI blocks
  - `sections/`: Page sections
  - `elements/`: Small UI elements
- **Store**: Uses Store class from globals module
  - `membershipsStore` - manages memberships with handleMembershipUpdate method
  - `departmentsStore` - manages departments
  - `invitesStore` - manages invites
- **Router**: Vue Router configuration with nested routes

## Key Features

1. **Organization Management**: CRUD operations for organizations with owner/member relationships
2. **Department System**: Hierarchical department structure within organizations
3. **Membership System**: User roles and permissions within organizations
4. **Invite System**: Invitation workflow for adding members
5. **Access Control**: Fine-grained permissions using ABAC
6. **Caching**: Redis-like caching with tag-based invalidation

## API Endpoints

All modules now follow the standard Store class pattern:

### Organizations
- `GET /api/organizations` - List organizations with filters
- `POST /api/organizations/create` - Create new organization
- `POST /api/organizations/:_id/update` - Update organization
- `DELETE /api/organizations/:_id/delete` - Delete organization

### Departments
- `GET /api/departments/read` - Read with query parameters
- `POST /api/departments/create` - Create new department
- `PUT /api/departments/update` - Update department
- `POST /api/departments/delete` - Delete department (expects {_id} in body)

### Memberships
- `GET /api/memberships/read` - Read with query parameters
- `POST /api/memberships/create` - Create new membership
- `PUT /api/memberships/update` - Update membership
- `POST /api/memberships/delete` - Delete membership (expects {_id} in body)

### Invites
- `GET /api/invites/read` - Read with query parameters (owner, target, search)
- `POST /api/invites/create` - Create new invite
- `PUT /api/invites/update` - Update invite
- `POST /api/invites/delete` - Delete invite (expects {_id} in body)

## Important Patterns

1. **Aggregation Pipeline**: Complex queries use MongoDB aggregation with dynamic stages
2. **Caching Strategy**: Results cached with tags for selective invalidation
3. **Access Control**: Uses ABAC with policies defined in `organizations.policies.js`
4. **Lookup Configurations**: Modular lookup configs for related data
5. **Query Processing**: Utility functions for building dynamic queries

## Model Structures

### Organization Model
```javascript
{
  owner: ObjectId (ref: 'User', required),
  official: Boolean (default: false),
  types: Array (required),
  profile: {
    photo: String,
    name: String (required),
    description: String,
    tags: [String]
  },
  contacts: {
    email: String,
    website: String,
    phone: String,
    address: String
  },
  socials: {
    telegram: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String
  },
  rating: {
    popularity: Number (0-1),
    median: Number (0-5),
    amount: Number
  },
  accesses: AccessesSchema,
  views: Number (default: 0),
  timestamps: true
}
```

### Department Model
```javascript
{
  owner: ObjectId (ref: 'User'),
  organization: ObjectId (ref: 'Organization'),
  hidden: Boolean (default: false),
  profile: {
    photo: String,
    name: String (required),
    description: String,
    categories: [String]
  },
  worktime: [{
    day: String,
    time: { start: String, end: String }
  }],
  delivery: [String],
  payment: [String],
  members: [{
    user: ObjectId (ref: 'User'),
    position: String (default: 'Member')
  }],
  subdepartments: [ObjectId (ref: 'Department')],
  accesses: AccessesSchema,
  timestamps: true
}
```

### Membership Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  type: String (enum: ['organization', 'department', 'user'], required),
  role: String (default: 'subscriber'),
  label: String (default: 'subscriber'),
  target: ObjectId (dynamic ref based on type),
  timestamps: true
}
```

### Invite Model
```javascript
{
  code: String (required, unique),
  status: String (enum: ['active', 'used', 'deactivated']),
  role: String (default: 'member'),
  // From credentials schema:
  phone: String,
  email: String,
  apple_id: String,
  // From ownership schema:
  owner: { type: String, target: ObjectId },
  creator: { type: String, target: ObjectId, hidden: Boolean },
  timestamps: true
}
```

### Accesses Schema
Permission structure for modules:
```javascript
{
  categories: { create, read, edit, delete },
  rents: { create, read, edit, delete },
  spots: { create, read, edit, delete },
  posts: { create, read, edit, delete },
  events: { create, read, edit, delete },
  tickets: { create, read, edit, delete },
  gallery: { read, create, edit, delete },
  members: { read, edit, delete },
  inventory: { read, edit, delete },
  products: { read, edit, delete },
  departments: { read, edit, delete },
  orders: { read, confirm, delete }
}
```
All permissions are Boolean fields defaulting to false.

## Key Interfaces

### API Request/Response Formats

#### Organization Query Parameters
- `_id`: Single organization ID
- `types`: Filter by organization types
- `official`: Filter official organizations
- `search`: Text search in organization names
- `sortParam`, `sortOrder`: Sorting options
- `skip`, `limit`: Pagination
- `user`: User ID for membership filtering
- `postable`: Filter by postable status
- `contain`: Filter by contained elements
- `prices`: Price range filtering (when products included)

#### Lookup Options
Request related data using query parameters:
- `memberships`: Include membership data
- `products`: Include products
- `spots`: Include locations
- `members`: Include member details

### Store Integration

All stores use the Store class from `@martyrs/src/modules/core/views/classes/core.store.js`:

```javascript
import Store from '@martyrs/src/modules/core/views/classes/core.store.js';

const membershipsStore = new Store('/api/memberships');
const departmentsStore = new Store('/api/departments');
const invitesStore = new Store('/api/invites');
```

#### membershipsStore.handleMembershipUpdate
Special method for updating user state when membership changes:
```javascript
membershipsStore.handleMembershipUpdate(user, membership, status, target, statusName, statusNumber)
```

### Feed Component Integration
Use v-model:items pattern for reactive state:
```vue
<Feed
  v-model:items="membersList"
  :store="{
    read: (options) => membershipsStore.read(options)
  }"
  :options="{
    target: route.params._id,
    role: ['member','owner']
  }"
>
```

### Controller Response Format
- **Read operations**: Return array of items directly
- **Delete operations**: Return the deleted object
- **Create/Update**: Return the created/updated object

## Dependencies

- Mongoose for MongoDB ODM
- Express for routing
- Vue 3 with Composition API
- Custom modules from `@martyrs/src/modules/core/`