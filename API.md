# ResearchFlow API Documentation

This document describes all available API endpoints in ResearchFlow.

## Base URL

```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Authentication

Most endpoints require authentication. Include the session cookie or JWT token in your requests.

## Endpoints

### Authentication

#### Register User

```http
POST /api/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe" (optional)
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### NextAuth Endpoints

```http
POST /api/auth/signin
POST /api/auth/signout
GET /api/auth/session
POST /api/auth/callback/credentials
```

See [NextAuth.js documentation](https://next-auth.js.org/) for details.

---

### Search

#### Search Papers

```http
GET /api/search?q={query}&limit={limit}&source={source}
```

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results (default: 10, max: 100)
- `source` (optional): API source - `all`, `semantic-scholar`, `openalex`, `crossref` (default: `all`)

**Response:**
```json
{
  "results": [
    {
      "id": "paper-id",
      "title": "Paper Title",
      "authors": ["Author 1", "Author 2"],
      "abstract": "Paper abstract...",
      "venue": "Conference/Journal",
      "publicationDate": "2024-01-01",
      "doi": "10.1234/example",
      "citationCount": 42,
      "pdfUrl": "https://...",
      "source": "Semantic Scholar"
    }
  ],
  "total": 100
}
```

---

### Papers

#### List User Papers

```http
GET /api/papers?page={page}&perPage={perPage}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "papers": [...],
  "total": 50,
  "page": 1,
  "perPage": 20,
  "totalPages": 3
}
```

#### Create Paper

```http
POST /api/papers
```

**Body:**
```json
{
  "title": "Paper Title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Abstract text",
  "publicationDate": "2024-01-01",
  "venue": "Conference Name",
  "doi": "10.1234/example",
  "citationCount": 0,
  "pdfUrl": "https://..."
}
```

**Response:**
```json
{
  "id": "clx...",
  "title": "Paper Title",
  ...
}
```

---

### Collections

#### List Collections

```http
GET /api/collections
```

**Response:**
```json
{
  "collections": [
    {
      "id": "clx...",
      "name": "My Collection",
      "description": "Collection description",
      "parentId": null,
      "papers": [...],
      "children": [...]
    }
  ]
}
```

#### Create Collection

```http
POST /api/collections
```

**Body:**
```json
{
  "name": "Collection Name",
  "description": "Optional description",
  "parentId": "parent-collection-id" (optional)
}
```

#### Delete Collection

```http
DELETE /api/collections?id={collectionId}
```

---

### Insights

#### List Insights

```http
GET /api/insights?status={status}
```

**Query Parameters:**
- `status` (optional): Filter by status - `backlog`, `in-progress`, `done`

**Response:**
```json
{
  "insights": [
    {
      "id": "clx...",
      "title": "Insight Title",
      "content": "Insight content",
      "type": "finding",
      "tags": ["tag1", "tag2"],
      "status": "backlog",
      "paperId": "paper-id",
      "paper": {...}
    }
  ]
}
```

#### Create Insight

```http
POST /api/insights
```

**Body:**
```json
{
  "title": "Insight Title",
  "content": "Insight content",
  "type": "finding",
  "tags": ["tag1", "tag2"],
  "status": "backlog",
  "paperId": "paper-id" (optional)
}
```

#### Update Insight

```http
PATCH /api/insights
```

**Body:**
```json
{
  "id": "insight-id",
  "status": "in-progress",
  "title": "Updated title" (optional),
  ... other fields
}
```

---

### Annotations

#### List Annotations

```http
GET /api/annotations?paperId={paperId}
```

**Query Parameters:**
- `paperId` (optional): Filter by paper ID

**Response:**
```json
{
  "annotations": [
    {
      "id": "clx...",
      "content": "Annotation text",
      "highlight": "Highlighted text",
      "color": "yellow",
      "pageNumber": 5,
      "paperId": "paper-id"
    }
  ]
}
```

#### Create Annotation

```http
POST /api/annotations
```

**Body:**
```json
{
  "content": "Annotation text",
  "highlight": "Text being highlighted",
  "color": "yellow",
  "pageNumber": 5,
  "paperId": "paper-id"
}
```

---

### Citations

#### Generate Citation

```http
POST /api/citations
```

**Body:**
```json
{
  "paperId": "paper-id",
  "style": "apa", // apa, mla, chicago, harvard, ieee, vancouver
  "format": "text" // text, bibtex, ris
}
```

**Response:**
```json
{
  "citation": "Formatted citation string"
}
```

---

### AI Services

#### Summarize Paper

```http
POST /api/ai/summarize
```

**Body:**
```json
{
  "title": "Paper Title",
  "abstract": "Paper abstract",
  "fullText": "Full paper text (optional)"
}
```

**Response:**
```json
{
  "summary": "Concise summary of the paper",
  "methodology": "Research methodology",
  "findings": "Key findings",
  "limitations": "Study limitations"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": {} (optional, for validation errors)
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, no rate limiting is enforced. For production deployments, consider implementing rate limiting to prevent abuse.

## Examples

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Search papers:**
```bash
curl "http://localhost:3000/api/search?q=machine+learning&limit=5"
```

**Create a paper (requires authentication):**
```bash
curl -X POST http://localhost:3000/api/papers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Example Paper",
    "authors": ["Author One", "Author Two"],
    "abstract": "This is an example abstract"
  }'
```

### Using JavaScript/Fetch

```javascript
// Register
const response = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  })
})
const data = await response.json()

// Search papers
const searchResponse = await fetch('/api/search?q=machine+learning')
const searchData = await searchResponse.json()

// Create paper (with session)
const paperResponse = await fetch('/api/papers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Example Paper',
    authors: ['Author One'],
    abstract: 'Abstract text'
  })
})
```

## Notes

- All dates are in ISO 8601 format
- Arrays should be valid JSON arrays
- File uploads are not yet implemented for PDFs
- The API follows RESTful conventions
- All endpoints return JSON responses

## Future Enhancements

Planned API improvements:
- GraphQL endpoint for complex queries
- Webhooks for notifications
- Batch operations for bulk updates
- Real-time WebSocket connections
- Advanced filtering and sorting
- Pagination metadata improvements
