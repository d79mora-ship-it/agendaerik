# 🏆 CODING STANDARDS & BEST PRACTICES
> **Global Reference for AI-Assisted Programming Excellence**
> Version 4.2.0 | Last Updated: 2025 | Maintained by: Engineering Excellence Council

---

## 📋 TABLE OF CONTENTS

1. [Philosophy & Principles](#1-philosophy--principles)
2. [Universal Code Quality Rules](#2-universal-code-quality-rules)
3. [Naming Conventions](#3-naming-conventions)
4. [Code Structure & Architecture](#4-code-structure--architecture)
5. [Error Handling & Resilience](#5-error-handling--resilience)
6. [Security Standards](#6-security-standards)
7. [Performance Engineering](#7-performance-engineering)
8. [Testing Standards](#8-testing-standards)
9. [Documentation Standards](#9-documentation-standards)
10. [Code Review Protocol](#10-code-review-protocol)
11. [Refactoring Guidelines](#11-refactoring-guidelines)
12. [Language-Specific Standards](#12-language-specific-standards)

---

## 1. Philosophy & Principles

### The Fundamental Covenant

> *"Any fool can write code that a computer can understand. Good programmers write code that humans can understand."*
> — Martin Fowler

Every line of code written must serve three masters simultaneously:

1. **The Machine** — It must execute correctly and efficiently
2. **The Human** — It must be readable, maintainable, and understandable
3. **The Future** — It must be extensible, testable, and evolvable

### Core Software Engineering Principles

#### SOLID Principles
```
S — Single Responsibility Principle
    A class/function should have ONE reason to change.
    
O — Open/Closed Principle
    Open for extension, CLOSED for modification.
    
L — Liskov Substitution Principle
    Subtypes must be substitutable for their base types.
    
I — Interface Segregation Principle
    Clients should not depend on interfaces they don't use.
    
D — Dependency Inversion Principle
    Depend on abstractions, not concretions.
```

#### Additional Pillars
```
DRY  — Don't Repeat Yourself
       Every piece of knowledge must have a SINGLE, unambiguous representation.

KISS — Keep It Simple, Stupid
       Simplicity is the ultimate sophistication.

YAGNI — You Aren't Gonna Need It
        Implement only what is needed NOW.

SoC  — Separation of Concerns
        Different concerns should live in different places.
```

---

## 2. Universal Code Quality Rules

### 2.1 The Golden Rules

```
RULE 01: Code is read 10x more than it is written. Optimize for reading.
RULE 02: If it needs a comment to be understood, it needs to be rewritten.
RULE 03: Functions do ONE thing and do it well.
RULE 04: Functions have NO side effects unless explicitly stated.
RULE 05: Never use magic numbers. Always use named constants.
RULE 06: Fail FAST and fail LOUDLY. Silent failures are unacceptable.
RULE 07: Validate ALL inputs at system boundaries.
RULE 08: Prefer composition over inheritance.
RULE 09: Immutability by default; mutability by explicit choice.
RULE 10: Delete dead code. Don't comment it out.
```

### 2.2 Function Design Rules

| Rule | Bad ❌ | Good ✅ |
|------|--------|---------|
| Single Responsibility | `processUserDataAndSendEmail()` | `processUserData()`, `sendWelcomeEmail()` |
| Descriptive Names | `calc()`, `doStuff()` | `calculateMonthlyRevenue()`, `validateEmailFormat()` |
| Minimal Parameters | `f(a,b,c,d,e,f)` | `f(config: Config)` — use objects for 3+ params |
| No Boolean Traps | `render(true, false, true)` | `render({ isVisible: true, isCached: false })` |
| Command-Query Separation | `getAndUpdate()` | `get()` + `update()` separately |

### 2.3 Complexity Budget

```
Cyclomatic Complexity:
  ✅ 1-5   — Simple, excellent
  ⚠️  6-10  — Moderate, acceptable with tests
  🔴 11-20  — Complex, MUST refactor
  💀 >20   — CRITICAL, refactor immediately

Function Length:
  ✅ 1-20 lines   — Ideal
  ⚠️  21-40 lines  — Acceptable
  🔴 41-80 lines  — Needs review
  💀 >80 lines    — Split immediately

File Length:
  ✅ <200 lines   — Ideal
  ⚠️  200-400 lines — Acceptable
  🔴 400-700 lines — Consider splitting
  💀 >700 lines   — Mandatory split
```

---

## 3. Naming Conventions

### 3.1 Universal Naming Rules

```
✅ Names must be:
   - Pronounceable in spoken conversation
   - Searchable (avoid single-letter vars except loop counters)
   - Self-documenting (reduce need for comments)
   - Consistent with domain language (ubiquitous language)
   - Free of encodings or prefixes (no Hungarian notation)

❌ Names must NOT be:
   - Abbreviations unless universally known (url, id, api are OK)
   - Generic/vague (data, info, temp, val, obj)
   - Misleading (accountList if it's not a List type)
   - Negative (isNotActive → use isInactive)
```

### 3.2 Convention by Context

```python
# Constants — SCREAMING_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
DATABASE_CONNECTION_TIMEOUT_MS = 5000
DEFAULT_PAGE_SIZE = 25

# Classes — PascalCase, noun phrases
class UserAuthenticationService:
class PaymentTransactionRepository:
class EmailNotificationHandler:

# Functions/Methods — camelCase or snake_case (by language), verb phrases
def calculate_compound_interest():      # Python
function getUserByEmail():              # JavaScript
def sendPasswordResetEmail():

# Interfaces (languages that have them) — I-prefix or Adjective
interface IRepository:         # C#
interface Serializable:        # Java/Kotlin
interface Cacheable:           # General

# Private members — underscore prefix (Python convention)
class Service:
    def __init__(self):
        self._cache = {}          # Private
        self.__secret_key = ""    # Name-mangled

# Booleans — is/has/can/should prefix
is_authenticated = True
has_permission = False
can_delete = True
should_notify = False
```

### 3.3 Semantic Precision Table

| Context | Weak Name ❌ | Strong Name ✅ |
|---------|-------------|---------------|
| Get single item | `getUser()` | `findUserById()`, `getUserOrThrow()` |
| Get collection | `getUsers()` | `findAllActiveUsers()`, `searchUsersByRole()` |
| Boolean check | `check()` | `isEmailVerified()`, `hasAdminPrivileges()` |
| Transform data | `convert()` | `normalizePhoneNumber()`, `serializeToJson()` |
| Side-effect action | `process()` | `publishEventToQueue()`, `persistToDatabase()` |
| Async operations | `getData()` | `fetchUserProfileAsync()`, `loadConfigurationAsync()` |

---

## 4. Code Structure & Architecture

### 4.1 The Architecture Pyramid

```
┌─────────────────────────────────────────────┐
│          PRESENTATION LAYER                  │
│     (UI, API Controllers, CLI Handlers)      │
├─────────────────────────────────────────────┤
│          APPLICATION LAYER                   │
│     (Use Cases, Commands, Queries)           │
├─────────────────────────────────────────────┤
│            DOMAIN LAYER                      │
│     (Entities, Value Objects, Domain Events) │
├─────────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER                 │
│  (Database, External APIs, File System)      │
└─────────────────────────────────────────────┘

RULE: Dependencies point INWARD only.
      Infrastructure depends on Domain. Never the reverse.
```

### 4.2 Module Organization Pattern

```
project/
├── src/
│   ├── domain/              # Business rules (NO external dependencies)
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/    # Interfaces only
│   │   └── services/        # Domain services
│   │
│   ├── application/         # Orchestrates domain logic
│   │   ├── commands/        # Write operations
│   │   ├── queries/         # Read operations
│   │   ├── handlers/        # Command/Query handlers
│   │   └── dtos/            # Data Transfer Objects
│   │
│   ├── infrastructure/      # Implements domain interfaces
│   │   ├── persistence/     # DB implementations
│   │   ├── external-api/    # Third-party integrations
│   │   └── messaging/       # Queue/Event implementations
│   │
│   └── presentation/        # Entry points
│       ├── api/             # REST/GraphQL controllers
│       ├── cli/             # CLI commands
│       └── events/          # Event consumers
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    ├── architecture/
    └── api/
```

### 4.3 Dependency Management Rules

```
✅ ALLOWED:
   - Dependency Injection (DI containers or manual)
   - Constructor injection (preferred over setter/field injection)
   - Programming to interfaces, not implementations
   - Pure functions with explicit dependencies

❌ FORBIDDEN:
   - Global mutable state (singletons with mutable state)
   - Service Locator pattern (hides dependencies)
   - Circular dependencies between modules
   - Direct instantiation of infrastructure in domain/application layers
```

---

## 5. Error Handling & Resilience

### 5.1 Error Handling Hierarchy

```
Level 1 — Input Validation (at boundaries)
  → Validate ALL external input immediately
  → Return specific, actionable error messages
  → Never let invalid data penetrate the system core

Level 2 — Domain Validation
  → Business rule violations throw domain exceptions
  → Exceptions carry full context (what failed, why, where)
  → No swallowing exceptions silently

Level 3 — Infrastructure Errors
  → Network failures: Retry with exponential backoff
  → Database errors: Appropriate transaction rollback
  → Third-party failures: Circuit breaker pattern

Level 4 — Unrecoverable Errors
  → Log full context before dying
  → Fail safely (preserve data integrity)
  → Alert on-call engineer
```

### 5.2 Exception Design

```python
# ✅ CORRECT — Specific, contextual exceptions
class InsufficientFundsError(DomainError):
    def __init__(self, account_id: str, available: Decimal, required: Decimal):
        self.account_id = account_id
        self.available = available
        self.required = required
        super().__init__(
            f"Account {account_id} has insufficient funds. "
            f"Available: {available}, Required: {required}"
        )

# ❌ WRONG — Generic, context-free exceptions
raise Exception("Error")
raise ValueError("Something went wrong")
```

### 5.3 Resilience Patterns

```
Circuit Breaker:
  CLOSED  → Requests flow normally
  OPEN    → Requests fail immediately (fast fail)
  HALF    → Limited requests to test recovery

Retry Policy:
  Max attempts: 3
  Backoff: exponential (1s, 2s, 4s)
  Jitter: ±20% to prevent thundering herd
  Retryable: Network timeouts, 503, 429
  Non-retryable: 400, 401, 403, 404, 422

Timeout Hierarchy:
  Database queries:     < 100ms (simple), < 1s (complex)
  Internal API calls:   < 500ms
  External API calls:   < 3s
  Background jobs:      Configurable, always bounded
```

---

## 6. Security Standards

### 6.1 The Security Commandments

```
COMMANDMENT 1: NEVER trust user input. Validate and sanitize EVERYTHING.
COMMANDMENT 2: NEVER store secrets in code, config files, or version control.
COMMANDMENT 3: NEVER log sensitive data (passwords, tokens, PII, card numbers).
COMMANDMENT 4: ALWAYS use parameterized queries. NEVER string-concatenate SQL.
COMMANDMENT 5: ALWAYS hash passwords with bcrypt/argon2 (min cost factor 12).
COMMANDMENT 6: ALWAYS use HTTPS for all external communication.
COMMANDMENT 7: ALWAYS apply principle of least privilege.
COMMANDMENT 8: ALWAYS validate on the server. Client validation is UX only.
COMMANDMENT 9: NEVER expose internal errors to end users.
COMMANDMENT 10: ALWAYS audit-log security-sensitive operations.
```

### 6.2 Input Validation Schema

```python
# Every external input must pass through validation
def validate_user_registration(data: dict) -> ValidationResult:
    """
    Validate at the boundary. Sanitize. Type-check. Constrain.
    """
    rules = {
        'email': [
            required(),
            max_length(254),           # RFC 5321
            matches_regex(EMAIL_REGEX),
            normalize(lambda x: x.lower().strip())
        ],
        'password': [
            required(),
            min_length(12),
            max_length(128),
            contains_uppercase(),
            contains_lowercase(),
            contains_digit(),
            contains_special_char(),
            not_in_breached_passwords_list()
        ],
        'age': [
            required(),
            is_integer(),
            min_value(18),
            max_value(120)
        ]
    }
    return validate(data, rules)
```

### 6.3 OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| Injection (SQL, NoSQL, OS) | Parameterized queries, ORM, input validation |
| Broken Authentication | MFA, secure session management, rate limiting |
| Sensitive Data Exposure | Encryption at rest/transit, data minimization |
| XXE | Disable external entity processing in XML parsers |
| Broken Access Control | RBAC/ABAC, deny by default, ownership checks |
| Security Misconfiguration | Infrastructure as Code, hardened defaults |
| XSS | Content Security Policy, output encoding, React/Vue auto-escaping |
| Insecure Deserialization | Avoid deserializing untrusted data, integrity checks |
| Known Vulnerabilities | Automated dependency scanning (Snyk, Dependabot) |
| Insufficient Logging | Structured logging, SIEM integration, alerting |

---

## 7. Performance Engineering

### 7.1 Performance Budget

```
Web Application Response Times:
  < 100ms  — Instant (ideal for all API responses)
  < 500ms  — Fast (acceptable for most API responses)
  < 1000ms — Noticeable lag (investigate and optimize)
  > 3000ms — Unacceptable (immediate fix required)

Database Query Times:
  < 10ms   — Excellent (properly indexed, cached)
  < 100ms  — Good (acceptable for most queries)
  < 500ms  — Slow (needs optimization)
  > 500ms  — Critical (index missing or query redesign needed)
```

### 7.2 Optimization Hierarchy

```
FIRST: Measure. NEVER optimize without profiling data.
       "Premature optimization is the root of all evil." — Knuth

PRIORITY ORDER for optimization:
  1. Algorithm complexity     (O(n²) → O(n log n))
  2. Data structure selection (List → HashMap for lookups)
  3. Database queries         (N+1 → JOIN, add indexes)
  4. Caching strategy         (Redis, CDN, HTTP cache headers)
  5. Concurrency & async      (non-blocking I/O, parallelism)
  6. Code-level optimization  (last resort, with benchmarks)
```

### 7.3 Caching Decision Matrix

```
                  ┌──────────────────────────────────┐
                  │         Data Changes?             │
                  └──────────────────────────────────┘
                         /              \
                     Rarely           Frequently
                       /                  \
             Cache aggressively      Cache with short TTL
             (CDN, browser cache,    or use cache-aside
              long TTL)              with invalidation
                       
Cache Layers:
  L1: In-memory (process)     — microseconds, small, volatile
  L2: Distributed (Redis)     — milliseconds, large, shared
  L3: CDN                     — milliseconds, global, static
  L4: Database query cache    — milliseconds, SQL-level
  L5: HTTP cache              — varies, client/proxy level
```

---

## 8. Testing Standards

### 8.1 The Testing Pyramid

```
        /\
       /  \
      / E2E \      ← Slow, expensive, few (5-10%)
     /────────\
    / Integration\  ← Medium speed, moderate (20-30%)
   /──────────────\
  /   Unit Tests   \  ← Fast, cheap, many (60-70%)
 /──────────────────\
```

### 8.2 Test Quality Rules

```
A test MUST be:
  ✅ FAST      — Milliseconds, not seconds
  ✅ ISOLATED  — No shared state between tests
  ✅ REPEATABLE — Same result every run (no randomness, no time dependency)
  ✅ SELF-VALIDATING — Pass or fail, no manual inspection
  ✅ TIMELY    — Written before or alongside the code

A test MUST NOT:
  ❌ Call external services (use mocks/stubs/fakes)
  ❌ Depend on test execution order
  ❌ Have logic (conditionals, loops) in assertions
  ❌ Test implementation details (test behavior, not internals)
  ❌ Share mutable state with other tests
```

### 8.3 Test Structure — AAA Pattern

```python
def test_transfer_funds_success():
    # ─── ARRANGE ───────────────────────────────────────────────
    source_account = Account(id="ACC-001", balance=Decimal("1000.00"))
    target_account = Account(id="ACC-002", balance=Decimal("500.00"))
    transfer_service = FundsTransferService(
        account_repository=InMemoryAccountRepository([source_account, target_account]),
        event_bus=FakeEventBus()
    )
    
    # ─── ACT ───────────────────────────────────────────────────
    result = transfer_service.transfer(
        from_account_id="ACC-001",
        to_account_id="ACC-002",
        amount=Decimal("250.00")
    )
    
    # ─── ASSERT ────────────────────────────────────────────────
    assert result.is_success
    assert source_account.balance == Decimal("750.00")
    assert target_account.balance == Decimal("750.00")
```

### 8.4 Coverage Requirements

```
Minimum Coverage Thresholds:
  Domain Layer:          95% line coverage
  Application Layer:     90% line coverage
  Infrastructure Layer:  75% line coverage (mock boundaries)
  Overall Project:       80% line coverage

Coverage is NECESSARY but NOT SUFFICIENT.
High coverage with poor tests is worse than low coverage
with excellent tests (false confidence).

Mutation Testing Score Target: > 70%
(Ensures tests actually detect bugs, not just execute code)
```

---

## 9. Documentation Standards

### 9.1 Code Documentation Rules

```
DOCUMENT:
  ✅ WHY a decision was made (not what the code does)
  ✅ Non-obvious algorithms with time/space complexity
  ✅ Known limitations and edge cases
  ✅ Workarounds for external system quirks
  ✅ Public API contracts (parameters, returns, exceptions)
  ✅ Deprecation notices with migration path

DO NOT DOCUMENT:
  ❌ What the code obviously does (self-documenting code)
  ❌ Type information already in the signature
  ❌ Boilerplate that adds noise without value
```

### 9.2 Function Documentation Template

```python
def calculate_amortization_schedule(
    principal: Decimal,
    annual_rate: Decimal,
    term_months: int,
    start_date: date
) -> list[AmortizationPayment]:
    """
    Calculate a complete loan amortization schedule.
    
    Uses the standard annuity formula:
        payment = P * [r(1+r)^n] / [(1+r)^n - 1]
    where r = monthly rate, n = number of payments.
    
    Args:
        principal: Loan amount in the currency's base unit (must be > 0)
        annual_rate: Annual interest rate as decimal (0.05 = 5%)
        term_months: Loan term in months (must be > 0 and ≤ 360)
        start_date: Date of the first payment
    
    Returns:
        List of AmortizationPayment objects, one per payment period,
        with running balance, principal portion, and interest portion.
    
    Raises:
        ValueError: If principal ≤ 0 or term_months not in (0, 360]
        NegativeInterestRateError: If annual_rate < 0
    
    Note:
        Rounding uses ROUND_HALF_UP per banking industry standard.
        Final payment may differ slightly to eliminate rounding error.
    
    Example:
        >>> schedule = calculate_amortization_schedule(
        ...     principal=Decimal("200000"),
        ...     annual_rate=Decimal("0.045"),
        ...     term_months=360,
        ...     start_date=date(2025, 1, 1)
        ... )
        >>> schedule[0].payment_amount
        Decimal("1013.37")
    """
```

### 9.3 README Requirements

Every repository MUST contain a README with:

```markdown
# Project Name
[One-sentence description of what this does and why it exists]

## Quick Start (< 5 minutes to running)
## Architecture Overview
## Development Setup
## Running Tests
## Environment Variables (all, with descriptions)
## Deployment
## Contributing Guidelines
## License
```

---

## 10. Code Review Protocol

### 10.1 Reviewer Checklist

```
CORRECTNESS
  □ Logic is correct and handles all edge cases
  □ Business rules are properly implemented
  □ Concurrent access is handled safely
  □ No race conditions or deadlocks

QUALITY
  □ Naming is clear and follows conventions
  □ Functions are small and focused
  □ No unnecessary complexity
  □ No code duplication

SECURITY
  □ All input is validated
  □ No sensitive data in logs
  □ Authorization is checked
  □ No SQL injection vectors

TESTING
  □ Tests cover happy path and edge cases
  □ Tests are meaningful (not just coverage)
  □ Tests will catch regressions

PERFORMANCE
  □ No N+1 queries
  □ Appropriate indexes exist
  □ No unnecessary computation in loops
```

### 10.2 Review Communication Standards

```
Comment Prefixes (for clarity):
  BLOCKER:    Must be fixed before merge
  CONCERN:    Important issue, requires discussion
  SUGGESTION: Non-blocking improvement idea
  QUESTION:   Clarification needed
  PRAISE:     Explicitly acknowledge excellent work
  NIT:        Minor style issue, author's discretion

Example:
  BLOCKER: This query runs inside a loop, creating N+1 database calls.
           Move to a batch query before the loop.
  
  SUGGESTION: Consider extracting this into a separate method for
              readability. Not blocking, but would improve clarity.
  
  PRAISE: This error handling approach is excellent — the specific
          exception types make debugging much easier.
```

---

## 11. Refactoring Guidelines

### 11.1 Refactoring Signals (Code Smells)

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| Long Method | > 40 lines | Extract Method |
| Large Class | > 400 lines, too many responsibilities | Extract Class |
| Long Parameter List | > 3 params | Introduce Parameter Object |
| Duplicate Code | Same logic in multiple places | Extract Method/Superclass |
| Feature Envy | Method uses another class's data extensively | Move Method |
| Data Clumps | Same group of fields always together | Extract Class |
| Primitive Obsession | Using primitives for domain concepts | Replace with Value Object |
| Switch Statements | Large switch/if-else chains on type | Polymorphism/Strategy |
| Dead Code | Unreachable or unused code | Delete it |
| Speculative Generality | Code for features that don't exist yet | YAGNI — delete it |

### 11.2 Refactoring Safety Protocol

```
BEFORE refactoring, ensure:
  1. ✅ Tests exist that cover the code being changed
  2. ✅ Tests are GREEN (all passing)
  3. ✅ You understand what the code does

WHILE refactoring:
  1. Make ONE change at a time
  2. Run tests after EACH change
  3. Commit when tests are green
  4. Never mix refactoring with feature changes

NEVER refactor when:
  - You don't have tests (add tests first)
  - You're on a time-critical deadline
  - You don't understand the current behavior
```

---

## 12. Language-Specific Standards

### Python
```python
# Follow PEP 8 strictly
# Use type hints on all public functions (Python 3.9+)
# Use dataclasses or Pydantic for data containers
# Prefer f-strings over format() or %
# Use pathlib.Path over os.path
# Use contextlib for resource management

from __future__ import annotations
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

@dataclass(frozen=True)  # Immutable value object
class Money:
    amount: Decimal
    currency: str
    
    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError(f"Money amount cannot be negative: {self.amount}")
        if len(self.currency) != 3:
            raise ValueError(f"Currency must be ISO 4217 code: {self.currency}")
```

### JavaScript/TypeScript
```typescript
// Always use TypeScript for any non-trivial project
// Strict mode enabled: strict: true in tsconfig.json
// Avoid any — use unknown and narrow types
// Prefer const over let, never use var
// Use async/await over raw Promises
// Use optional chaining (?.) and nullish coalescing (??)

interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Explicit return types on all public functions
async function createUser(command: CreateUserCommand): Promise<UserId> {
  const existingUser = await userRepository.findByEmail(command.email);
  if (existingUser !== null) {
    throw new EmailAlreadyTakenError(command.email);
  }
  // ...
}
```

### Go
```go
// Always handle errors. Never ignore with _
// Use table-driven tests
// Keep interfaces small (1-3 methods ideal)
// Use context.Context for cancellation and timeouts

func (s *UserService) GetUser(ctx context.Context, id UserID) (*User, error) {
    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("GetUser: finding user %s: %w", id, err)
    }
    if user == nil {
        return nil, ErrUserNotFound
    }
    return user, nil
}
```

---

## 📌 QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────────┐
│              CODE QUALITY QUICK REFERENCE                │
├─────────────────────────────────────────────────────────┤
│  Function length:  < 20 lines (ideal) / < 40 lines max  │
│  File length:      < 200 lines (ideal) / < 500 lines max │
│  Complexity:       < 5 (ideal) / < 10 (acceptable)       │
│  Test coverage:    > 80% overall / > 95% domain          │
│  API response:     < 100ms (ideal) / < 500ms (acceptable)│
├─────────────────────────────────────────────────────────┤
│  BEFORE you code:  Understand the requirement fully      │
│  WHILE you code:   Make it work → Make it right          │
│  AFTER you code:   Review, test, document                │
├─────────────────────────────────────────────────────────┤
│  Ask always:  "Will my teammate understand this          │
│               at 3am during an incident?"                │
└─────────────────────────────────────────────────────────┘
```

---

*This document is a living standard. Propose changes via Pull Request with rationale.*
*All rules have exceptions — use engineering judgment, but document the exception.*
