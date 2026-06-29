# Survey System — Backend API Documentation

> **Project:** Eye_Patch Survey System  
> **Tech Stack (Frontend):** React 19, TypeScript, Vite, Tailwind CSS v4, Supabase (current auth/db), React Router v7  
> **Backend:** Node.js/Express, TypeScript, Prisma (SQLite)  
> **API Base URL:** `http://localhost:3000/api/v1`  
> **Interactive Docs (Swagger UI):** [`http://localhost:3000/api/v1/docs`](http://localhost:3000/api/v1/docs)  
> **Raw OpenAPI Spec:** [`http://localhost:3000/api/v1/docs/openapi.json`](http://localhost:3000/api/v1/docs/openapi.json)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
   - [Authentication](#31-authentication)
   - [User / Profile](#32-user--profile)
   - [Surveys](#33-surveys)
   - [Survey Sections & Questions](#34-survey-sections--questions)
   - [Survey Responses](#35-survey-responses)
   - [Participants](#36-participants)
   - [Analytics & Dashboard](#37-analytics--dashboard)
   - [Settings & Theme](#38-settings--theme)
   - [Search](#39-search)
   - [Landing Page (CMS / Static)](#310-landing-page-cms--static)
4. [Question Types Reference](#4-question-types-reference)
5. [Error Handling](#5-error-handling)

---

## 1. Project Overview

### Core Features (from Frontend Analysis)

| Feature Area | Details |
|---|---|
| **Landing Page** | Hero, Impact stats, Info cards, Compatible integrations, News/Updates, FAQ, Demo CTA, Footer |
| **Authentication** | Sign up, Login, Google OAuth, Session management |
| **Dashboard Analytics** | Stats cards (Survey Quantity, Responses, Question Responded, New Questions), Recent Surveys |
| **Survey CRUD** | Create (5-step wizard), Read, Update, Delete, Duplicate, Change Status |
| **Survey Builder** | Sections with questions (5 types: text, multiple_choice, single_choice, likert_scale, yes_no) |
| **Survey Sharing** | Copy link, QR Code, Embed code |
| **Survey Responses** | Per-survey responses table, Global responses view |
| **Participant Management** | Participant list, Participant detail (contact info, history, attributes) |
| **Participant Communication** | Send email to participants |
| **Settings** | Profile settings, Account & Billing, Global Appearance (light/dark, accent colors), Theme Picture |
| **Search** | Global search across surveys, responses, participants |
| **Notifications** | Bell icon (notification system) |

---

## 2. Database Schema

### 2.1 `users` / `profiles`
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  user_name     VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 `surveys`
```sql
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'inactive', 'closed');

CREATE TABLE surveys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(100),
  target_audience VARCHAR(100),
  goal            TEXT,
  usage           VARCHAR(100),         -- 'improve-service', 'research', 'decision-making'
  status          survey_status DEFAULT 'draft',
  response_limit  INT DEFAULT NULL,     -- NULL = unlimited
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surveys_creator ON surveys(creator_id);
CREATE INDEX idx_surveys_status ON surveys(status);
```

### 2.3 `survey_sections`
```sql
CREATE TABLE survey_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id   UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_survey ON survey_sections(survey_id);
```

### 2.4 `survey_questions`
```sql
CREATE TYPE question_type AS ENUM (
  'text', 'multiple_choice', 'single_choice', 'likert_scale', 'yes_no'
);

CREATE TABLE survey_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id    UUID NOT NULL REFERENCES survey_sections(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  type          question_type NOT NULL,
  required      BOOLEAN DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_section ON survey_questions(section_id);
```

### 2.5 `question_options`
```sql
CREATE TABLE question_options (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  value         VARCHAR(255) NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_options_question ON question_options(question_id);
```

### 2.6 `participants`
```sql
CREATE TABLE participants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id     UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  email         VARCHAR(255),
  name          VARCHAR(255),
  status        VARCHAR(50) DEFAULT 'active',   -- 'active', 'inactive'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, email)
);

CREATE INDEX idx_participants_survey ON participants(survey_id);
```

### 2.7 `survey_responses`
```sql
CREATE TABLE survey_responses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  participant_id  UUID REFERENCES participants(id) ON DELETE SET NULL,
  respondent_email VARCHAR(255),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  time_taken_sec  INT,                    -- calculated on completion
  completion_rate DECIMAL(5,2)            -- percentage
);

CREATE INDEX idx_responses_survey ON survey_responses(survey_id);
```

### 2.8 `response_answers`
```sql
CREATE TABLE response_answers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id   UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id   UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer_text   TEXT,                     -- for text-type answers
  answer_options UUID[],                  -- array of selected option IDs (for choice types)
  likert_value  INT,                      -- for likert_scale (1-5)
  yes_no_value  BOOLEAN,                  -- for yes_no
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_answers_response ON response_answers(response_id);
CREATE INDEX idx_answers_question ON response_answers(question_id);
```

### 2.9 `notifications`
```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  message       TEXT,
  type          VARCHAR(50),              -- 'new_response', 'survey_closed', 'system'
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
```

### 2.10 `user_settings`
```sql
CREATE TABLE user_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appearance        VARCHAR(10) DEFAULT 'light',   -- 'light' | 'dark'
  accent_color      VARCHAR(20) DEFAULT 'default', -- 'default' | 'blue' | 'green' | 'red' | 'purple'
  theme_picture     VARCHAR(20) DEFAULT 'none',    -- 'city' | 'nature' | 'marble' | 'none'
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. API Endpoints

### 3.1 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login with email/password | ❌ |
| `POST` | `/api/auth/google` | Google OAuth login (placeholder) | ❌ |
| `POST` | `/api/auth/logout` | Logout current session | ✅ |
| `POST` | `/api/auth/refresh` | Refresh access token (placeholder) | ✅ |
| `GET`  | `/api/auth/me` | Get current authenticated user | ✅ |
| `PUT`  | `/api/auth/password` | Update current user's password | ✅ |

#### `POST /api/auth/signup`
```json
{
  "email": "user@example.com",
  "userName": "johndoe",
  "password": "Str0ng!Pass"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "jwt...",
    "user": { "id": "uuid", "email": "user@example.com", "userName": "johndoe" }
  }
}
```

#### `POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "Str0ng!Pass"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt...",
    "user": { "id": "uuid", "email": "user@example.com", "userName": "johndoe" }
  }
}
```

#### `PUT /api/auth/password`
```json
{
  "currentPassword": "Str0ng!Pass",
  "newPassword": "NewStr0ng!Pass"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```
Returns **401** if current password is incorrect. Returns **400** if new password is the same as the current.

---

### 3.2 User / Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/users/me` | Get my profile | ✅ |
| `PUT` | `/api/users/me/username` | Update username | ✅ |
| `PUT` | `/api/users/me/avatar` | Update avatar (accepts a URL string) | ✅ |
| `DELETE` | `/api/users/me` | Delete my account | ✅ |
| `GET` | `/api/users/:id` | Get user by ID (admin) | ✅ |

#### `PUT /api/users/me/username`
```json
{
  "userName": "new_username"
}
```
**Response (200):** Updated profile object. Returns **400** if the username is the same as the current one.

#### `PUT /api/users/me/avatar`
```json
{
  "avatarUrl": "https://example.com/avatar.png"
}
```
**Response (200):** Updated profile object. Returns **400** if the avatar URL is the same as the current one.

---

### 3.3 Surveys

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/surveys` | List my surveys (with filters) | ✅ |
| `POST` | `/api/surveys` | Create a new survey | ✅ |
| `POST` | `/api/surveys/draft` | Save a draft (partial data, all fields optional) | ✅ |
| `GET` | `/api/surveys/:id` | Get survey detail (full structure) | ✅ |
| `PUT` | `/api/surveys/:id` | Update a draft (partial data + sections) | ✅ |
| `DELETE` | `/api/surveys/:id` | Delete a survey | ✅ |
| `PATCH` | `/api/surveys/:id/status` | Change survey status | ✅ |
| `POST` | `/api/surveys/:id/duplicate` | Duplicate a survey | ✅ |
| `POST` | `/api/surveys/:id/publish` | Publish a draft (validates & sets status to active) | ✅ |

#### `GET /api/surveys`
**Query Parameters:**
- `status` — Filter by status: `draft`, `active`, `inactive`, `closed`
- `category` — Filter by category
- `search` — Search by title
- `page`, `limit` — Pagination
- `sort_by` — `created_at`, `title`, `status` (default: `created_at`)
- `order` — `asc`, `desc` (default: `desc`)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Customer Satisfaction Survey",
      "description": "Help us improve our service",
      "status": "active",
      "category": "feedback",
      "response_count": 83,
      "avg_response_time": 252,
      "completion_rate": 65.0,
      "created_at": "2026-06-01T10:00:00Z",
      "updated_at": "2026-06-15T14:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "total_pages": 3 }
}
```

#### `POST /api/surveys`
Creates a survey **without** sections/questions (those are added via separate endpoints or a bulk creation endpoint).

```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our service",
  "category": "feedback",
  "target_audience": "customers",
  "goal": "To understand customer satisfaction levels",
  "usage": "improve-service",
  "status": "draft",
  "response_limit": 100,
  "start_date": "2026-07-01",
  "end_date": "2026-07-31"
}
```
**Response (201):** Full survey object.

#### `PATCH /api/surveys/:id/status`
```json
{
  "status": "active"
}
```
**Response (200):** Updated survey.

#### `POST /api/surveys/draft`
Creates a new draft survey. All fields are optional — only fields that are provided are saved. Sections, questions, and options can be included inline.

```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our service",
  "category": "feedback",
  "audience": "customers",
  "goal": "To understand satisfaction levels",
  "usage": "improve-service",
  "responseLimit": -1,
  "startDate": "2026-07-01",
  "endDate": "2026-07-15",
  "sections": [
    {
      "title": "Section 1",
      "questions": [
        { "text": "How satisfied are you?", "type": "likert_scale", "required": true }
      ]
    }
  ]
}
```
**Response (201):**
```json
{ "id": "uuid" }
```

#### `PUT /api/surveys/:id`
Updates an existing draft survey. Has the same shape as `POST /api/surveys/draft`. If `sections` is provided, all existing sections are **replaced** with the new ones.

**Response (200):** Full survey object with sections, questions, and options.

#### `POST /api/surveys/:id/publish`
Validates that the draft has required fields (title, at least one section with at least one question), then changes the status from `"draft"` to `"active"`. No request body needed.

**Response (200):**
```json
{
  "success": true,
  "message": "Survey published successfully",
  "data": { /* updated survey object */ }
}
```

---

### 3.4 Survey Sections & Questions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/surveys/:id/sections` | Add a section (with questions) | ✅ |
| `PUT` | `/api/sections/:id` | Update a section | ✅ |
| `DELETE` | `/api/sections/:id` | Delete a section | ✅ |
| `PUT` | `/api/sections/reorder` | Reorder sections | ✅ |
| `POST` | `/api/sections/:id/questions` | Add a question to a section | ✅ |
| `PUT` | `/api/questions/:id` | Update a question | ✅ |
| `DELETE` | `/api/questions/:id` | Delete a question | ✅ |
| `PUT` | `/api/questions/reorder` | Reorder questions | ✅ |
| `POST` | `/api/questions/:id/options` | Add option to question | ✅ |
| `PUT` | `/api/options/:id` | Update an option | ✅ |
| `DELETE` | `/api/options/:id` | Delete an option | ✅ |
#### `POST /api/surveys/:id/sections`
```json
{
  "title": "Section 1",
  "sort_order": 0,
  "questions": [
    {
      "text": "How satisfied are you?",
      "type": "likert_scale",
      "required": true,
      "sort_order": 0
    },
    {
      "text": "Which feature do you like most?",
      "type": "single_choice",
      "required": true,
      "sort_order": 1,
      "options": [
        { "value": "Speed", "sort_order": 0 },
        { "value": "Design", "sort_order": 1 },
        { "value": "Support", "sort_order": 2 }
      ]
    },
    {
      "text": "Any additional comments?",
      "type": "text",
      "required": false,
      "sort_order": 2
    }
  ]
}
```
**Response (201):** Full section with nested questions and options.

> **Note:** Question types and their validation rules are documented in [Section 4](#4-question-types-reference).

---

### 3.5 Survey Responses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/surveys/:id/responses` | List responses for a survey | ✅ |
| `GET` | `/api/responses` | Global responses (all surveys) | ✅ |
| `GET` | `/api/responses/:id` | Get a single response with answers | ✅ |
| `POST` | `/api/surveys/:id/responses` | Submit a response (public) | ❌ |
| `DELETE` | `/api/responses/:id` | Delete a response | ✅ |
| `GET` | `/api/surveys/:id/responses/export` | Export responses (CSV/JSON) | ✅ |

#### `GET /api/surveys/:id/responses`
**Query Parameters:**
- `page`, `limit` — Pagination
- `sort_by` — `completed_at`, `time_taken_sec`
- `order` — `asc`, `desc`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "respondent_email": "respondent@example.com",
      "completed_at": "2026-06-15T10:30:00Z",
      "time_taken_sec": 252,
      "answers": [
        {
          "question_id": "uuid",
          "question_text": "How satisfied are you?",
          "answer_text": null,
          "likert_value": 4,
          "yes_no_value": null,
          "selected_options": []
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 83 }
}
```

#### `POST /api/surveys/:id/responses` (Public Submission)
```json
{
  "respondent_email": "user@example.com",
  "answers": [
    {
      "question_id": "uuid",
      "answer_text": "Great platform!",           // text type
      "answer_option_ids": [],                     // choice types
      "likert_value": null,                        // likert_scale (1-5)
      "yes_no_value": null                         // yes_no (true/false)
    }
  ]
}
```
**Response (201):** Created response object.

> **Validation Rules:**
> - Required questions must have a non-null answer.
> - `multiple_choice` — expects `answer_option_ids` (array, 1+ selections).
> - `single_choice` — expects `answer_option_ids` (array, exactly 1 selection).
> - `text` — expects `answer_text` (string).
> - `likert_scale` — expects `likert_value` (integer 1-5).
> - `yes_no` — expects `yes_no_value` (boolean).
> - Response limit is checked before accepting; returns `403` if reached.

---

### 3.6 Participants

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/surveys/:id/participants` | List participants for a survey | ✅ |
| `POST` | `/api/surveys/:id/participants` | Add participant(s) to a survey | ✅ |
| `GET` | `/api/participants/:id` | Get participant detail | ✅ |
| `PUT` | `/api/participants/:id` | Update participant | ✅ |
| `DELETE` | `/api/participants/:id` | Remove participant | ✅ |
| `GET` | `/api/participants` | List all participants (global) | ✅ |
| `POST` | `/api/participants/:id/send-email` | Send survey email to participant | ✅ |
| `POST` | `/api/participants/bulk-import` | Bulk import participants (CSV) | ✅ |

#### `POST /api/surveys/:id/participants`
```json
{
  "participants": [
    { "email": "user1@example.com", "name": "User One" },
    { "email": "user2@example.com", "name": "User Two" }
  ]
}
```
**Response (201):** Array of created participants.

#### `GET /api/participants/:id`
**Response (200):**
```json
{
  "id": "uuid",
  "name": "User One",
  "email": "user1@example.com",
  "status": "active",
  "survey_id": "uuid",
  "survey_title": "Customer Satisfaction Survey",
  "created_at": "2026-06-10T08:00:00Z",
  "responses": [
    {
      "response_id": "uuid",
      "survey_id": "uuid",
      "completed_at": "2026-06-15T10:30:00Z",
      "time_taken_sec": 252
    }
  ],
  "response_count": 1
}
```

---

### 3.7 Analytics & Dashboard

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/dashboard/stats` | Get dashboard statistics | ✅ |
| `GET` | `/api/dashboard/recent-surveys` | Get recent surveys | ✅ |
| `GET` | `/api/surveys/:id/analytics` | Get analytics for a specific survey | ✅ |

#### `GET /api/dashboard/stats`
**Response (200):**
```json
{
  "survey_quantity": 13,
  "total_responses": 124,
  "questions_responded": 580,
  "new_questions": 83,
  "change_percentages": {
    "survey_quantity": 8,
    "total_responses": 12,
    "questions_responded": 3,
    "new_questions": 80
  }
}
```

#### `GET /api/dashboard/recent-surveys`
**Query Parameters:** `limit` (default: 5)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "User Journey Exploration",
      "status": "active",
      "description": "...",
      "author_name": "Indra Lesmana",
      "author_avatar": "https://...",
      "response_count": 83,
      "response_limit": 50,
      "created_at": "2026-06-01T10:00:00Z"
    }
  ]
}
```

#### `GET /api/surveys/:id/analytics`
**Response (200):**
```json
{
  "total_responses": 83,
  "completion_rate": 65.0,
  "average_time_sec": 252,
  "responses_over_time": [
    { "date": "2026-06-01", "count": 5 },
    { "date": "2026-06-02", "count": 12 }
  ],
  "question_breakdown": [
    {
      "question_id": "uuid",
      "question_text": "How satisfied are you?",
      "type": "likert_scale",
      "responses": {
        "1": 2, "2": 5, "3": 15, "4": 40, "5": 21
      },
      "average": 3.88
    }
  ]
}
```

---

### 3.8 Settings & Theme

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/settings` | Get user settings | ✅ |
| `PUT` | `/api/settings/appearance-accent` | Update appearance and accent color together | ✅ |
| `PUT` | `/api/settings/theme-picture` | Update theme picture | ✅ |

#### `PUT /api/settings/appearance-accent`
```json
{
  "appearance": "dark",
  "accent_color": "blue"
}
```
**Response (200):** Updated settings object. Returns **400** if both values are the same as the current settings.

#### `PUT /api/settings/theme-picture`
```json
{
  "theme_picture": "nature"
}
```
**Response (200):** Updated settings object. Returns **400** if the theme picture is the same as the current one.

> Settings are also stored client-side in localStorage, but the backend serves as the source of truth for cross-device sync.

---

### 3.9 Search

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/search` | Global search across surveys, responses, participants | ✅ |

#### `GET /api/search?q=keyword`
**Query Parameters:**
- `q` — Search query (required)
- `type` — Filter by type: `surveys`, `responses`, `participants`, `all` (default)
- `page`, `limit` — Pagination

**Response (200):**
```json
{
  "surveys": [
    { "id": "uuid", "title": "Survey title matching query", "status": "active" }
  ],
  "participants": [
    { "id": "uuid", "name": "Matching name", "email": "email@example.com" }
  ],
  "responses": [
    { "id": "uuid", "respondent_email": "matching@example.com", "survey_id": "uuid" }
  ]
}
```

---

### 3.10 Landing Page (CMS / Static)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/landing/stats` | Get impact stats for landing page | ❌ |
| `GET` | `/api/landing/faq` | Get FAQ data | ❌ |
| `GET` | `/api/landing/news` | Get news & updates | ❌ |
| `POST` | `/api/contact` | Submit contact/demo inquiry | ❌ |

#### `GET /api/landing/stats`
```json
{
  "stats": [
    { "tag": "Time Saving", "percent": "40%", "info": "less manual effort", "note": "..." },
    { "tag": "Smarter Insights", "percent": "60%", "info": "deeper understanding", "note": "..." },
    { "tag": "Cost Efficiency", "percent": "35%", "info": "lower research spend", "note": "..." }
  ]
}
```

#### `POST /api/contact`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'd like a demo of your survey platform."
}
```
**Response (200):** `{ "message": "Inquiry submitted successfully." }`

---

## 4. Question Types Reference

| Type | Enum Value | Input Method | Backend Storage | Validation |
|------|-----------|--------------|-----------------|------------|
| Text | `text` | Free text input | `answer_text` (TEXT) | Max length (configurable, default 5000 chars) |
| Multiple Choice | `multiple_choice` | Checkboxes | `answer_options` (UUID[]) | At least 1 selection, max all |
| Single Choice | `single_choice` | Radio buttons | `answer_options` (UUID[1]) | Exactly 1 selection |
| Likert Scale | `likert_scale` | 5 radio buttons | `likert_value` (INT 1-5) | Value 1-5 |
| Yes/No | `yes_no` | 2 radio buttons | `yes_no_value` (BOOLEAN) | `true` or `false` |

### Validation Rules per Question Type

| Type | Has Options? | Min Options | Max Options |
|------|:-----------:|:-----------:|:-----------:|
| `text` | ❌ | — | — |
| `multiple_choice` | ✅ | 2 | Unlimited |
| `single_choice` | ✅ | 2 | Unlimited |
| `likert_scale` | ❌ | — | — |
| `yes_no` | ❌ | — | — |

---

## 5. Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "code": "invalid_type",
      "message": "Field validation error"
    }
  ]
}
```

### HTTP Status Codes Used
| Code | Meaning |
|:----:|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error / Same-value conflict |
| 401 | Unauthorized (no/invalid token or wrong password) |
| 403 | Forbidden (e.g., response limit reached, survey closed) |
| 404 | Resource Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 503 | Server unavailable (connection error) |

### Common Error Scenarios
| Scenario | Status | Message |
|----------|:-----:|---------|
| Validation failed | 400 | `"Validation failed"` with field-level errors |
| Same username on update | 400 | `"New username is the same as the current username"` |
| Same avatar on update | 400 | `"New avatar is the same as the current avatar"` |
| Same password on update | 400 | `"New password must be different from the current password"` |
| Invalid credentials | 401 | `"Invalid email or password"` |
| Wrong current password | 401 | `"Current password is incorrect"` |
| No auth token | 401 | `"Authentication required. Provide a valid Bearer token."` |
| Survey response limit reached | 403 | `"Response limit reached"` |
| Survey closed | 403 | `"Survey is not accepting responses"` |
| Not found | 404 | `"Survey not found"` / `"User not found"` etc. |
| Duplicate email | 409 | `"Email already in use"` |
| Server connection error | 503 | `"Unable to connect to the Server. Please check your internet connection and try again."` |

---

## Notes for Implementation

1. **Authentication Flow:** Use JWT tokens with access + refresh token pattern. The current frontend uses Supabase Auth — a custom backend should replicate the same flow.

2. **Public Submission Endpoint:** The `POST /api/surveys/:id/responses` endpoint should NOT require authentication (anyone can submit), but should include:
   - Rate limiting per IP
   - CAPTCHA support for spam prevention
   - Response limit validation before accepting

3. **Survey Sharing Endpoints (Future):**
   - `GET /api/surveys/:id/share/link` — Generate shareable link
   - `GET /api/surveys/:id/share/qr-code` — Generate QR code image
   - `GET /api/surveys/:id/share/embed` — Get embed code snippet

4. **CORS:** Allow the frontend origin in development and production.

5. **Pagination:** All list endpoints support `page` and `limit` query parameters with consistent response format.

6. **File Upload:** If file/image upload is needed for survey questions, add a `POST /api/upload` endpoint returning a URL.
