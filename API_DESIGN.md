# 🌐 API DESIGN STANDARDS
> **The Complete Reference for Professional API Engineering**
> REST, GraphQL, and general principles for world-class API design.

---

## 🎯 API DESIGN PHILOSOPHY

> *"An API is a user interface for developers. It deserves the same care,
> empathy, and attention to detail as any consumer product."*

### The Principles of Great APIs

```
CONSISTENCY   — Do the same thing the same way, always
SIMPLICITY    — Simple things should be simple, complex things possible
PREDICTABILITY — Developers should rarely be surprised
COMPLETENESS  — Do what it says; say what it does
EVOLVABILITY  — Support change without breaking existing clients
SECURITY      — Secure by default, not secure by configuration
```

---

## 🏗️ REST API DESIGN

### Resource Naming

```
Resources are NOUNS, never verbs.
Actions are expressed through HTTP methods.

✅ CORRECT:
  GET    /api/v1/users              — List users
  POST   /api/v1/users              — Create a user
  GET    /api/v1/users/:id          — Get a user
  PATCH  /api/v1/users/:id          — Update a user
  DELETE /api/v1/users/:id          — Delete a user

  GET    /api/v1/users/:id/orders   — List user's orders
  POST   /api/v1/orders/:id/cancel  — Cancel an order (action on resource)

❌ WRONG:
  POST   /api/v1/createUser         — Verb in URL
  GET    /api/v1/getUserByEmail     — Verb in URL
  POST   /api/v1/user/delete        — Wrong method for delete
  GET    /api/v1/doPayment          — Non-resource URL

Naming rules:
  - Always lowercase
  - Hyphens, not underscores: /user-profiles (not /user_profiles)
  - Plural nouns for collections: /users (not /user)
  - Singular for singletons: /api/v1/profile (user's own profile)
```

### HTTP Methods and Their Semantics

| Method | Action | Idempotent | Safe | Has Body |
|--------|--------|-----------|------|----------|
| GET | Read | ✅ Yes | ✅ Yes | No |
| POST | Create / Action | ❌ No | ❌ No | Yes |
| PUT | Replace (full update) | ✅ Yes | ❌ No | Yes |
| PATCH | Partial update | ❌ No | ❌ No | Yes |
| DELETE | Delete | ✅ Yes | ❌ No | Optional |

```
Idempotent = calling it N times has the same effect as calling it once
Safe = does not modify server state (read-only)

PATCH vs PUT:
  PUT    replaces the ENTIRE resource with the provided body
  PATCH  applies a PARTIAL update (only provided fields change)
  
  Use PATCH for most update operations.
  Use PUT only when the entire resource is being replaced.
```

### HTTP Status Codes Reference

```
2xx — SUCCESS
  200 OK           — Successful GET, PUT, PATCH
  201 Created      — Successful POST (include Location header)
  202 Accepted     — Async operation started (return job ID)
  204 No Content   — Successful DELETE or action with no response body

3xx — REDIRECTION
  301 Moved Permanently  — URL changed, update your references
  304 Not Modified       — Conditional GET, use your cached version

4xx — CLIENT ERRORS (The client did something wrong)
  400 Bad Request        — Invalid syntax, validation failed
  401 Unauthorized       — Authentication required or invalid
  403 Forbidden          — Authenticated but not authorized
  404 Not Found          — Resource does not exist
  405 Method Not Allowed — HTTP method not supported
  409 Conflict           — State conflict (duplicate, version mismatch)
  410 Gone               — Resource existed but was permanently deleted
  422 Unprocessable      — Valid syntax but semantic validation failed
  429 Too Many Requests  — Rate limit exceeded
  
5xx — SERVER ERRORS (Something broke on our side)
  500 Internal Server Error  — Unexpected server error
  502 Bad Gateway            — Upstream service failure
  503 Service Unavailable    — Server overloaded or in maintenance
  504 Gateway Timeout        — Upstream service timed out

Rules:
  ✅ Use the MOST SPECIFIC code that applies
  ✅ ALWAYS return 4xx for client mistakes, 5xx for server mistakes
  ❌ NEVER return 200 with an error in the body
  ❌ NEVER return 500 for client input errors
```

### Request/Response Envelope

```json
// ✅ Success response
{
  "data": {
    "id": "usr_01HZ3KBQB5N6TW4M5T3EXKVNFH",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "createdAt": "2025-01-15T09:30:00Z"
  },
  "meta": {
    "requestId": "req_7f3a91b2"
  }
}

// ✅ Success list response (paginated)
{
  "data": [
    { "id": "usr_01...", "email": "jane@example.com" },
    { "id": "usr_02...", "email": "john@example.com" }
  ],
  "meta": {
    "total": 1432,
    "page": 1,
    "perPage": 20,
    "nextCursor": "dXNlcl8wMkg...",
    "requestId": "req_7f3a91b2"
  }
}

// ✅ Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains validation errors.",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email must be a valid email address."
      },
      {
        "field": "age",
        "code": "MIN_VALUE",
        "message": "Age must be at least 18. Received: 15."
      }
    ],
    "requestId": "req_7f3a91b2",
    "documentationUrl": "https://docs.api.example.com/errors/VALIDATION_ERROR"
  }
}
```

### Pagination — Cursor vs Offset

```
CURSOR-BASED (Recommended for production APIs):
  Advantages:
    - Consistent results even when data changes between pages
    - Efficient — O(1) seek with proper indexing
    - Works with real-time data
  
  Request:  GET /api/v1/users?limit=20&cursor=dXNlcl8wMkg
  Response: {
    "data": [...],
    "meta": {
      "nextCursor": "dXNlcl8wMkh...",  // null if last page
      "hasNextPage": true
    }
  }
  
  Cursor implementation:
    cursor = base64(last_item_id + timestamp)  // opaque to client

OFFSET-BASED (Simpler, acceptable for admin/internal APIs):
  Request:  GET /api/v1/users?page=3&limit=20
  Response: {
    "data": [...],
    "meta": {
      "total": 1432,
      "page": 3,
      "perPage": 20,
      "totalPages": 72
    }
  }
```

### Filtering, Sorting, and Field Selection

```
Filtering:
  GET /api/v1/users?status=active
  GET /api/v1/orders?status=pending&minAmount=100
  GET /api/v1/products?category=electronics&inStock=true
  
  Date range filtering:
  GET /api/v1/orders?createdAfter=2025-01-01T00:00:00Z&createdBefore=2025-02-01T00:00:00Z

Sorting:
  GET /api/v1/users?sort=createdAt:desc
  GET /api/v1/users?sort=lastName:asc,firstName:asc  // Multiple fields

Field selection (sparse fieldsets):
  GET /api/v1/users?fields=id,email,name     // Only return specified fields
  
  Useful for mobile clients that need minimal payloads.

Searching:
  GET /api/v1/users?q=john+smith            // Full-text search
  GET /api/v1/products?q=wireless+headphones
```

---

## 🔐 API AUTHENTICATION & AUTHORIZATION

### Authentication Patterns

```
JWT (JSON Web Tokens) — Standard for stateless APIs
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

  Token structure:
  {
    "sub": "usr_01HZ3KB...",    // Subject (user ID)
    "iss": "api.example.com",   // Issuer
    "aud": "app.example.com",   // Audience
    "iat": 1705312200,          // Issued at
    "exp": 1705312200 + 1800,   // Expires (30 min from issue)
    "jti": "tok_7f3a91b2",      // JWT ID (for revocation)
    "roles": ["user"],
    "permissions": ["orders:read", "orders:write"]
  }

  Access token:  Short-lived (15-30 minutes)
  Refresh token: Long-lived (30 days), stored securely (httpOnly cookie or secure storage)
  
  Refresh flow:
    POST /api/v1/auth/refresh
    Body: { "refreshToken": "..." }
    Response: { "accessToken": "...", "expiresIn": 1800 }

API Keys — For service-to-service or developer access
  X-API-Key: key_live_abc123xyz789
  
  Key format: {prefix}_{environment}_{random}
  Prefix identifies key type: key_, sk_, pk_
  Store only the hash, never the plaintext key
```

### Authorization — RBAC Pattern

```
Role → Permission → Resource Action

Example RBAC definition:
  
  Permissions:
    users:read      — View user data
    users:write     — Create/update user data
    users:delete    — Delete users
    orders:read     — View orders
    orders:write    — Create/update orders
    admin:*         — All administrative actions
  
  Roles:
    viewer:      [users:read, orders:read]
    editor:      [users:read, users:write, orders:read, orders:write]
    admin:       [users:*, orders:*, admin:*]
  
  Resource-level authorization:
    user can only access their own resources unless admin
    orders belong to user who created them
    
Authorization middleware:
  1. Extract JWT from Authorization header
  2. Verify signature and expiration
  3. Check required permissions for endpoint
  4. Check resource ownership if applicable
  5. Deny with 403 if any check fails
```

---

## 🛡️ API SECURITY CHECKLIST

```
AUTHENTICATION
  □ All non-public endpoints require authentication
  □ Failed auth returns 401 (not 404 — don't reveal existence)
  □ Token expiration is enforced server-side
  □ Refresh tokens can be revoked
  □ Brute force protection on auth endpoints

AUTHORIZATION
  □ Every request checks authorization, not just authentication
  □ Principle of least privilege applied to all roles
  □ Horizontal privilege escalation prevented (can't access other user's data)
  □ Admin endpoints are separately authorized

INPUT VALIDATION
  □ All input validated at API boundary
  □ Content-Type header validated
  □ Request size limits enforced (prevent DoS)
  □ File uploads validated (type, size, content)

RATE LIMITING
  □ Rate limits applied per API key/user
  □ Rate limit headers included in responses
  □ Graduated response (warn before block)
  
  Recommended limits:
    Authentication endpoints: 10 requests/minute
    Standard API endpoints:   100 requests/minute per user
    Bulk/export endpoints:    10 requests/minute per user

TRANSPORT
  □ HTTPS only (redirect HTTP to HTTPS)
  □ TLS 1.2+ minimum (TLS 1.3 preferred)
  □ HSTS header present

RESPONSE HEADERS
  □ Content-Security-Policy
  □ X-Content-Type-Options: nosniff
  □ X-Frame-Options: DENY
  □ Referrer-Policy: strict-origin-when-cross-origin
  □ No server version headers (remove Server, X-Powered-By)
```

---

## 📊 API VERSIONING STRATEGY

```
WHEN to version:
  - Breaking changes to request/response format
  - Removing existing fields
  - Changing field semantics
  - Removing endpoints

WHEN NOT to version:
  - Adding new optional fields (backward compatible)
  - Adding new endpoints
  - Performance improvements
  - Bug fixes that align with documented behavior

VERSIONING APPROACHES:

URL versioning (Recommended for simplicity):
  https://api.example.com/v1/users
  https://api.example.com/v2/users
  
  ✅ Visible and explicit
  ✅ Easy to test in browser
  ✅ Cacheable
  ❌ Violates "URL should identify resource, not representation"

Header versioning (Recommended for purists):
  Accept: application/vnd.example.v2+json
  
  ✅ URLs stay clean
  ❌ Not visible in browser URL
  ❌ Harder to test manually

DEPRECATION POLICY:
  - Announce deprecation with minimum 6 months notice
  - Add Deprecation header to responses
  - Add Sunset header with removal date
  - Email API consumers with migration guide
  - Maintain version for 12 months after deprecation
  
  Deprecation response headers:
    Deprecation: true
    Sunset: Sat, 01 Jan 2026 00:00:00 GMT
    Link: <https://docs.example.com/migration/v1-to-v2>; rel="deprecation"
```

---

## ⚡ API PERFORMANCE

### Response Time Targets

```
Tier 1 (Synchronous, user-facing):
  P50: < 50ms
  P95: < 200ms
  P99: < 500ms

Tier 2 (Background, non-critical):
  P95: < 2000ms

Tier 3 (Heavy computation, analytics):
  Use async: return 202 Accepted + job ID
  Client polls: GET /api/v1/jobs/:jobId
```

### Performance Optimization Checklist

```
□ Database queries use indexes (EXPLAIN ANALYZE all queries)
□ N+1 queries eliminated (use eager loading or batch queries)
□ Response payload minimized (sparse fieldsets, compression)
□ HTTP compression enabled (gzip/brotli for responses > 1KB)
□ Connection pooling configured
□ Caching implemented where appropriate:
    - GET requests: Cache-Control headers
    - ETag for conditional requests
    - Redis for computed/expensive results
□ Pagination enforced (no unbounded list endpoints)
□ Async processing for heavy operations
```

### Caching Headers

```http
# Long-lived static data (CDN cached)
Cache-Control: public, max-age=86400, s-maxage=86400

# Short-lived user data (client cached only)
Cache-Control: private, max-age=300

# Dynamic data that changes frequently
Cache-Control: no-store

# Conditional requests (ETag)
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
# Client sends: If-None-Match: "33a64df..."
# Server responds: 304 Not Modified (if unchanged) or 200 with new ETag
```

---

## 📖 API DOCUMENTATION STANDARD

### OpenAPI 3.1 Template

```yaml
openapi: 3.1.0
info:
  title: My Service API
  description: |
    Complete description of what this API does.
    
    ## Authentication
    All endpoints (except /auth/token) require Bearer token authentication.
    
    ## Rate Limiting
    Standard endpoints: 100 requests/minute per API key.
    Auth endpoints: 10 requests/minute.
  version: 2.4.0
  contact:
    name: API Support
    email: api-support@example.com
    url: https://docs.example.com/support
  license:
    name: MIT

servers:
  - url: https://api.example.com/v2
    description: Production
  - url: https://staging-api.example.com/v2
    description: Staging

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    User:
      type: object
      required: [id, email, name, createdAt]
      properties:
        id:
          type: string
          format: ulid
          example: "01HZ3KBQB5N6TW4M5T3EXKVNFH"
          readOnly: true
        email:
          type: string
          format: email
          example: "jane@example.com"
        name:
          type: string
          minLength: 1
          maxLength: 200
          example: "Jane Smith"
        createdAt:
          type: string
          format: date-time
          readOnly: true
    
    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
            details:
              type: array
              items:
                type: object
            requestId:
              type: string

security:
  - BearerAuth: []

paths:
  /users:
    get:
      summary: List users
      description: Returns a paginated list of users.
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: cursor
          in: query
          description: Pagination cursor from previous response
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: sort
          in: query
          schema:
            type: string
            enum: [createdAt:asc, createdAt:desc, name:asc, name:desc]
            default: createdAt:desc
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    type: object
                    properties:
                      nextCursor:
                        type: string
                        nullable: true
                      hasNextPage:
                        type: boolean
        '401':
          description: Authentication required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

---

*Great APIs are not built overnight. They are designed, debated, prototyped,*
*and iterated on. Invest the time upfront — an API, once public, is forever.*
