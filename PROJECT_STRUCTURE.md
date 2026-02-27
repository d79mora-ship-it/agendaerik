# 🏛️ PROJECT STRUCTURE & ORGANIZATION
> **Universal Reference for Codebase Architecture**
> How to organize a professional software project from day one.

---

## 📁 UNIVERSAL DIRECTORY STRUCTURE

### Full-Stack Application (Reference Architecture)

```
my-project/
│
├── 📄 README.md                    # Project entry point — must be excellent
├── 📄 CONTRIBUTING.md              # How to contribute
├── 📄 CHANGELOG.md                 # Version history
├── 📄 LICENSE                      # License file
├── 📄 .gitignore                   # Comprehensive ignore rules
├── 📄 .editorconfig                # Cross-editor formatting
├── 📄 docker-compose.yml           # Local development environment
├── 📄 docker-compose.test.yml      # Test environment
│
├── 📁 .github/                     # GitHub-specific config
│   ├── 📁 workflows/               # CI/CD pipeline definitions
│   │   ├── ci.yml
│   │   ├── cd-staging.yml
│   │   └── cd-production.yml
│   ├── 📄 PULL_REQUEST_TEMPLATE.md
│   ├── 📄 CODEOWNERS
│   └── 📁 ISSUE_TEMPLATE/
│
├── 📁 docs/                        # All project documentation
│   ├── 📁 architecture/            # Architecture decision records (ADRs)
│   │   ├── ADR-001-database-choice.md
│   │   └── ADR-002-authentication-strategy.md
│   ├── 📁 api/                     # API documentation
│   ├── 📁 deployment/              # Deployment guides
│   └── 📁 runbooks/                # Operational runbooks
│
├── 📁 infrastructure/              # Infrastructure as Code
│   ├── 📁 terraform/               # Cloud resource definitions
│   ├── 📁 kubernetes/              # K8s manifests
│   └── 📁 scripts/                 # Deployment and maintenance scripts
│
├── 📁 packages/                    # (Monorepo) Multiple packages
│   ├── 📁 backend/
│   └── 📁 frontend/
│
└── 📁 src/                         # (Monolith) Source code
    ├── [see backend/frontend structure below]
```

---

### Backend Service (Domain-Driven Design)

```
src/
│
├── 📁 domain/                      # The heart — ZERO external dependencies
│   ├── 📁 entities/                # Core business objects
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Product.ts
│   ├── 📁 value-objects/           # Immutable domain concepts
│   │   ├── EmailAddress.ts
│   │   ├── Money.ts
│   │   └── UserId.ts
│   ├── 📁 aggregates/              # Transaction boundaries
│   │   └── OrderAggregate.ts
│   ├── 📁 domain-events/           # Things that happened
│   │   ├── UserRegisteredEvent.ts
│   │   └── OrderPlacedEvent.ts
│   ├── 📁 repositories/            # Data access INTERFACES (not implementations)
│   │   ├── IUserRepository.ts
│   │   └── IOrderRepository.ts
│   ├── 📁 domain-services/         # Multi-entity business logic
│   │   └── PricingService.ts
│   └── 📁 exceptions/              # Domain-specific exceptions
│       ├── InsufficientFundsError.ts
│       └── UserNotFoundError.ts
│
├── 📁 application/                 # Orchestrates domain logic
│   ├── 📁 commands/                # Write operations (change state)
│   │   ├── RegisterUser/
│   │   │   ├── RegisterUserCommand.ts
│   │   │   ├── RegisterUserHandler.ts
│   │   │   └── RegisterUserHandler.test.ts
│   │   └── PlaceOrder/
│   │       ├── PlaceOrderCommand.ts
│   │       └── PlaceOrderHandler.ts
│   ├── 📁 queries/                 # Read operations (no state change)
│   │   ├── GetUserProfile/
│   │   │   ├── GetUserProfileQuery.ts
│   │   │   └── GetUserProfileHandler.ts
│   │   └── ListOrders/
│   ├── 📁 events/                  # Application event handlers
│   │   └── SendWelcomeEmailOnRegistration.ts
│   ├── 📁 ports/                   # Interfaces for infrastructure services
│   │   ├── IEmailService.ts
│   │   ├── IPaymentGateway.ts
│   │   └── IFileStorage.ts
│   └── 📁 dtos/                    # Data transfer objects
│       ├── UserProfileDto.ts
│       └── OrderSummaryDto.ts
│
├── 📁 infrastructure/              # External world implementations
│   ├── 📁 persistence/             # Database implementations
│   │   ├── 📁 repositories/        # Implements domain repository interfaces
│   │   │   ├── PostgresUserRepository.ts
│   │   │   └── PostgresOrderRepository.ts
│   │   ├── 📁 migrations/          # Database schema changes
│   │   │   ├── 001_create_users.sql
│   │   │   └── 002_create_orders.sql
│   │   └── 📁 seed/                # Test/development data
│   ├── 📁 external-services/       # Third-party API clients
│   │   ├── StripePaymentGateway.ts
│   │   ├── SendGridEmailService.ts
│   │   └── S3FileStorage.ts
│   ├── 📁 messaging/               # Queue/event bus implementations
│   │   └── RabbitMqEventBus.ts
│   └── 📁 cache/                   # Caching implementations
│       └── RedisCache.ts
│
├── 📁 presentation/                # Entry points to the application
│   ├── 📁 http/                    # REST API
│   │   ├── 📁 controllers/
│   │   │   ├── UserController.ts
│   │   │   └── OrderController.ts
│   │   ├── 📁 middleware/
│   │   │   ├── authentication.ts
│   │   │   ├── authorization.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── errorHandler.ts
│   │   ├── 📁 validators/          # Request validation schemas
│   │   │   └── createUserSchema.ts
│   │   └── router.ts
│   ├── 📁 graphql/                 # GraphQL (if used)
│   │   ├── 📁 resolvers/
│   │   └── schema.ts
│   └── 📁 jobs/                    # Background jobs / cron tasks
│       └── ProcessPendingOrdersJob.ts
│
├── 📁 config/                      # Configuration management
│   ├── database.ts
│   ├── server.ts
│   └── index.ts                    # Config aggregator with validation
│
├── 📁 shared/                      # Cross-cutting utilities
│   ├── 📁 logging/
│   ├── 📁 tracing/
│   └── 📁 utils/
│
└── main.ts                         # Application entry point
```

### Frontend Application (React/Next.js)

```
src/
│
├── 📁 app/                         # Next.js App Router (or pages/)
│   ├── 📁 (auth)/                  # Route groups
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── 📁 dashboard/
│   │   └── page.tsx
│   └── layout.tsx
│
├── 📁 components/                  # Reusable UI components
│   ├── 📁 ui/                      # Base design system components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   └── Modal/
│   ├── 📁 forms/                   # Form components
│   │   └── LoginForm/
│   └── 📁 layout/                  # Page layout components
│       ├── Header/
│       ├── Sidebar/
│       └── Footer/
│
├── 📁 features/                    # Feature-based modules
│   ├── 📁 authentication/
│   │   ├── api.ts                  # API calls for this feature
│   │   ├── hooks.ts                # Feature-specific hooks
│   │   ├── store.ts                # State management
│   │   └── types.ts
│   └── 📁 orders/
│
├── 📁 hooks/                       # Shared custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
├── 📁 lib/                         # Utilities and third-party config
│   ├── api-client.ts               # HTTP client configuration
│   ├── auth.ts                     # Auth configuration
│   └── utils.ts
│
├── 📁 stores/                      # Global state (Zustand, Redux)
│   ├── authStore.ts
│   └── uiStore.ts
│
├── 📁 types/                       # TypeScript type definitions
│   ├── api.types.ts
│   ├── domain.types.ts
│   └── global.d.ts
│
└── 📁 styles/                      # Global styles
    ├── globals.css
    └── tokens.css                  # Design tokens
```

---

## 📄 ESSENTIAL FILES EVERY PROJECT NEEDS

### README.md Template

````markdown
# Project Name

> One sentence describing what this is and the problem it solves.

[![CI Status](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](...)
[![Coverage](https://codecov.io/gh/org/repo/badge.svg)](...)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ⚡ Quick Start

```bash
git clone https://github.com/org/project.git
cd project
cp .env.example .env          # Configure environment
docker-compose up -d          # Start dependencies
npm install
npm run dev                   # Start development server
```

Open http://localhost:3000 — you should see [what they'll see].

## 🏗️ Architecture

```
[Brief architecture diagram or description]
```

**Key technology choices:**
- **Language/Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Testing:** Vitest + Supertest

## 🚀 Development

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- [Any other requirement]

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgres://user:pass@localhost:5432/db` |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) | `your-secret-here` |
| `REDIS_URL` | ✅ | Redis connection string | `redis://localhost:6379` |
| `LOG_LEVEL` | ❌ | Logging verbosity | `info` (default) |

### Running Tests

```bash
npm run test           # Unit tests
npm run test:int       # Integration tests
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Coverage report
```

### Code Quality

```bash
npm run lint           # ESLint
npm run typecheck      # TypeScript check
npm run format         # Prettier
```

## 📡 API Reference

API documentation: http://localhost:3000/api/docs (when running locally)

See [docs/api/](docs/api/) for full reference.

## 🚢 Deployment

See [docs/deployment/](docs/deployment/) for detailed deployment guides.

**Environments:**
| Environment | URL | Branch | Auto-deploy |
|-------------|-----|--------|-------------|
| Production | https://app.example.com | `main` | On merge |
| Staging | https://staging.example.com | `develop` | On merge |

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the development process.

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE).
````

---

### .editorconfig (Cross-Editor Standard)

```ini
# .editorconfig — Universal editor configuration
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab

[*.{py}]
indent_size = 4

[*.{go}]
indent_style = tab

[*.{java,kt}]
indent_size = 4

[{package.json,*.json}]
indent_size = 2
```

---

### Architecture Decision Record Template

```markdown
# ADR-XXX: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Deciders:** [Names or team]

## Context

[Describe the situation and problem that motivated this decision.
What is the technical, business, or organizational context?
What forces are at play?]

## Decision

[State the decision that was made.
Use active voice: "We will use X" not "X was decided to be used."]

## Considered Alternatives

### Option A: [Name]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

### Option B: [Name]
**Pros:**
- [Pro 1]

**Cons:**
- [Con 1]

## Rationale

[Explain why this option was chosen over the alternatives.
What factors were decisive?
What trade-offs were accepted?]

## Consequences

**Positive:**
- [What becomes easier or better]

**Negative:**
- [What becomes harder or worse]
- [Technical debt introduced]

**Risks:**
- [What might go wrong]

## Implementation Notes

[Practical notes for anyone implementing or working with this decision]
```

---

## 🌐 ENVIRONMENT CONFIGURATION

### The Twelve-Factor App Configuration

```python
# config/settings.py — Validated environment configuration

from pydantic import BaseSettings, validator, PostgresDsn, RedisDsn
from typing import Optional
import secrets

class Settings(BaseSettings):
    """
    All application configuration loaded from environment variables.
    Validation fails fast at startup with clear error messages.
    """
    
    # ─── Application ────────────────────────────────────────────
    APP_NAME: str = "MyService"
    APP_ENV: str  # "development" | "staging" | "production"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str
    
    # ─── Server ─────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # ─── Database ───────────────────────────────────────────────
    DATABASE_URL: PostgresDsn
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_ECHO: bool = False  # Never True in production
    
    # ─── Cache ──────────────────────────────────────────────────
    REDIS_URL: RedisDsn
    CACHE_TTL_SECONDS: int = 300
    
    # ─── Authentication ─────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # ─── External Services ──────────────────────────────────────
    SENDGRID_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    # ─── Observability ──────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: Optional[str] = None
    
    @validator("APP_ENV")
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "test", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"APP_ENV must be one of: {allowed}")
        return v
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v
    
    @validator("DEBUG")
    def debug_not_in_production(cls, v: bool, values: dict) -> bool:
        if v and values.get("APP_ENV") == "production":
            raise ValueError("DEBUG must be False in production")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Instantiate once at startup — fails hard if invalid
settings = Settings()
```

---

## 📊 PROJECT HEALTH METRICS

### Health Dashboard — What to Track

```
CODE QUALITY METRICS (checked in CI)
  ├── Test coverage: > 80% (enforced gate)
  ├── Mutation score: > 70%
  ├── Technical debt ratio: < 5% (SonarQube)
  ├── Code duplication: < 3%
  └── Cyclomatic complexity average: < 5

DEPENDENCY HEALTH (weekly automated check)
  ├── No critical CVE vulnerabilities
  ├── Dependencies not > 2 major versions behind
  ├── No unused direct dependencies
  └── No conflicting transitive dependencies

PRODUCTION HEALTH (continuous)
  ├── Error rate: < 0.1% of requests
  ├── P95 latency: < 500ms
  ├── Uptime: > 99.9%
  └── No memory leaks (stable memory over 24h)

TEAM HEALTH (weekly review)
  ├── PR cycle time: < 2 days
  ├── PR size: median < 200 lines
  ├── Failed deployments: < 10%
  └── Rollback frequency: < 2% of deployments
```

---

*A well-structured project is a gift to your future self and your teammates.*
*Invest in structure from day one. Retrofitting it is 10x harder.*
