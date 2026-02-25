# Journey Recorder — Backend

Express + MongoDB REST API for the Journey Recorder Chrome Extension.

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env if your MongoDB URI or port differs
```

### 3. Run locally

Development (auto-restart on changes):
```bash
npm run dev
```

Production:
```bash
npm start
```

The server starts on `http://localhost:3001` by default.

---

## API Reference

Base URL: `/api/v1`

---

### Health check

```
GET /health
```
```json
{ "status": "ok" }
```

---

### Get sessions by pathname

```
GET /api/v1/sessions?pathname=/apply/personal-loan
```

Returns all public sessions for the given pathname, sorted newest-first.

**Response**
```json
{
  "sessions": [
    {
      "id": "uuid-here",
      "label": "Test journey 1",
      "savedAt": "2024-01-15T10:30:00.000Z",
      "pathname": "/apply/personal-loan",
      "data": { "fullName": "John Doe", "loanAmount": "500000" },
      "excluded": [],
      "createdBy": "device-abc123",
      "isPublic": true
    }
  ]
}
```

**curl example**
```bash
curl "http://localhost:3001/api/v1/sessions?pathname=/apply/personal-loan"
```

---

### Save a session

```
POST /api/v1/sessions
```

**Body**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "label": "Test journey 1",
  "savedAt": "2024-01-15T10:30:00.000Z",
  "pathname": "/apply/personal-loan",
  "data": { "fullName": "John Doe", "loanAmount": "500000" },
  "excluded": ["otp"],
  "createdBy": "device-abc123"
}
```

**Response** `201 Created`
```json
{ "session": { ...saved document } }
```

**curl example**
```bash
curl -X POST http://localhost:3001/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "label": "Test journey 1",
    "savedAt": "2024-01-15T10:30:00.000Z",
    "pathname": "/apply/personal-loan",
    "data": { "fullName": "John Doe" },
    "excluded": [],
    "createdBy": "device-abc123"
  }'
```

---

### Update excluded fields

```
PATCH /api/v1/sessions/:id
```

Only the `excluded` array can be updated.

**Body**
```json
{ "excluded": ["otp", "captcha"] }
```

**Response**
```json
{ "session": { ...updated document } }
```

**curl example**
```bash
curl -X PATCH http://localhost:3001/api/v1/sessions/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{ "excluded": ["otp", "captcha"] }'
```

---

### Delete a session

```
DELETE /api/v1/sessions/:id
```

**Response**
```json
{ "ok": true }
```

**curl example**
```bash
curl -X DELETE http://localhost:3001/api/v1/sessions/550e8400-e29b-41d4-a716-446655440000
```

---

## Validation Rules

| Field       | Rule                                      |
|-------------|-------------------------------------------|
| `label`     | Required, max 100 characters              |
| `pathname`  | Required, must start with `/`             |
| `data`      | Required, non-empty object                |
| `excluded`  | Optional, array of strings (default `[]`) |
| `createdBy` | Required, string                          |

---

## Error Responses

| Status | Meaning              |
|--------|----------------------|
| 400    | Validation error     |
| 404    | Session not found    |
| 409    | Duplicate session id |
| 500    | Internal server error|

```json
{ "error": "descriptive message here" }
```
