# 🌿 GIT WORKFLOW & CI/CD STANDARDS
> **Professional Version Control & Delivery Pipeline Protocol**
> The complete reference for how code moves from idea to production.

---

## 📐 BRANCH ARCHITECTURE

### The Git Flow Model (Enterprise Standard)

```
                    ┌──────────────────────────────────────────────────┐
                    │                   PRODUCTION                      │
                    │               main / master                       │
                    └────────────────────┬─────────────────────────────┘
                                         │ merge via PR
                    ┌────────────────────▼─────────────────────────────┐
                    │                  STAGING                          │
                    │                 release/*                         │
                    └────────────────────┬─────────────────────────────┘
                                         │ merge via PR
                    ┌────────────────────▼─────────────────────────────┐
                    │                INTEGRATION                        │
                    │                  develop                          │
                    └──────┬───────────────────────┬───────────────────┘
                           │                       │
          ┌────────────────▼──┐         ┌─────────▼────────────────┐
          │   feature/*       │         │   fix/*  /  hotfix/*      │
          │ feature/add-auth  │         │ fix/login-null-pointer    │
          └───────────────────┘         └──────────────────────────┘
```

### Branch Naming Convention

```
Pattern: <type>/<ticket-id>-<short-description>

Types:
  feature/  — New functionality
  fix/      — Bug fixes (non-urgent)
  hotfix/   — Urgent production fixes (bypass develop)
  refactor/ — Code restructuring (no behavior change)
  docs/     — Documentation only
  test/     — Test additions or fixes
  chore/    — Build system, dependencies, tooling
  release/  — Release preparation branches

Examples:
  feature/PROJ-142-user-authentication
  fix/PROJ-189-cart-decimal-rounding
  hotfix/PROJ-201-payment-gateway-timeout
  refactor/PROJ-156-extract-email-service
  docs/PROJ-165-api-authentication-guide
  release/v2.4.0
```

### Branch Protection Rules (Configure in GitHub/GitLab)

```yaml
# Branch: main
protection_rules:
  required_status_checks:
    strict: true
    contexts:
      - "test/unit"
      - "test/integration"
      - "security/sast"
      - "quality/sonar"
  required_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
  restrictions:
    push: []           # No direct push allowed
    force_push: false
    deletions: false

# Branch: develop
protection_rules:
  required_status_checks:
    contexts:
      - "test/unit"
      - "test/integration"
  required_pull_request_reviews:
    required_approving_review_count: 1
  restrictions:
    force_push: false
```

---

## 📝 COMMIT MESSAGE STANDARD

### Conventional Commits Specification

```
Format:
  <type>(<scope>): <subject>
  
  [optional body]
  
  [optional footer(s)]

─────────────────────────────────────────────────────────────

TYPE (required):
  feat      — New feature (correlates with MINOR in SemVer)
  fix       — Bug fix (correlates with PATCH in SemVer)
  docs      — Documentation changes
  style     — Formatting, whitespace (no logic change)
  refactor  — Code restructuring (no feature, no fix)
  perf      — Performance improvement
  test      — Adding or updating tests
  build     — Build system, external dependencies
  ci        — CI/CD configuration
  chore     — Other changes that don't modify src or tests
  revert    — Revert a previous commit

SCOPE (optional):
  The module, component, or feature affected
  Example: (auth), (payment), (user-service), (api)

SUBJECT (required):
  - Imperative mood: "add" not "added" or "adds"
  - Lowercase first letter
  - No period at the end
  - Maximum 72 characters

BODY (optional):
  - Explain WHY (not what — the diff shows what)
  - Wrap at 100 characters
  - Separate from subject with blank line

FOOTER (optional):
  - Breaking changes: BREAKING CHANGE: <description>
  - Issue references: Closes #123, Fixes #456, Refs #789
```

### Commit Examples (High Quality Reference)

```bash
# ✅ Simple feature
git commit -m "feat(auth): add JWT refresh token rotation"

# ✅ Bug fix with scope
git commit -m "fix(payment): handle decimal rounding in EUR transactions"

# ✅ Complex commit with body
git commit -m "refactor(user-service): extract email validation to value object

Previous implementation scattered email format validation across multiple
controllers and services. This refactoring centralizes validation in an
EmailAddress value object that enforces invariants at construction time.

This makes the validation logic testable in isolation and ensures invalid
email addresses can never be created, regardless of entry point.

Closes #234"

# ✅ Breaking change
git commit -m "feat(api)!: rename /users endpoint to /accounts

BREAKING CHANGE: The /api/v1/users endpoint has been renamed to
/api/v1/accounts to better reflect the domain model. All existing
clients must update their API calls.

Migration guide: docs/migration/v2-api-changes.md"

# ❌ Bad commits (avoid)
git commit -m "fix"
git commit -m "updated stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
git commit -m "Fixed the bug that was causing problems"
```

---

## 🔀 PULL REQUEST PROTOCOL

### PR Creation Checklist

```
Before opening a PR, verify:

CODE QUALITY
  □ All tests pass locally
  □ New tests added for new functionality
  □ No linting errors
  □ No debug code, console.log, or temporary hacks
  □ No commented-out code blocks
  □ Documentation updated if behavior changed

SELF-REVIEW
  □ I have reviewed every line of my own diff
  □ The code does what the ticket requires
  □ I haven't introduced any tech debt without a ticket
  □ The PR is focused: one feature/fix per PR

SIZE
  □ PR is < 400 lines of change (excluding generated files)
  □ If larger, split into multiple PRs with a base branch
```

### PR Description Template

```markdown
## 📋 Summary
<!-- 2-3 sentences: What does this PR do and why? -->

## 🔗 Related
<!-- Link to ticket/issue: Closes #123 -->

## 🧪 How to Test
<!-- Step-by-step instructions for the reviewer to verify this works -->
1. Checkout this branch
2. Run `npm install`
3. Navigate to `Settings > Authentication`
4. Verify that [expected behavior]

## 📸 Screenshots / Demo
<!-- For UI changes: before/after screenshots -->
<!-- For API changes: example request/response -->

## ⚠️ Notes for Reviewer
<!-- Anything the reviewer should pay special attention to -->
<!-- Risky areas, complex logic, design decisions that need input -->

## ✅ Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or BREAKING CHANGE documented)
- [ ] Ready for production (no debug code, no TODOs without tickets)
```

### PR Size Guidelines

```
IDEAL PR size: 50-200 lines of meaningful change

If PR is > 400 lines:
  1. Can it be split into sequential PRs?
     (Base branch for shared code, then feature PR on top)
  2. Is a large change unavoidable?
     (Then add clear section markers and guide the reviewer)
  3. Large PRs ALWAYS require an architecture review first

PR split strategies:
  - Separate refactoring from feature addition
  - Split by layer (DB migration → Repository → Service → API)
  - Feature flags to merge incomplete features safely
```

---

## 🏷️ SEMANTIC VERSIONING

### Version Number Rules

```
Version format: MAJOR.MINOR.PATCH[-prerelease][+buildmetadata]

MAJOR — Breaking changes (incompatible API changes)
MINOR — New features (backward compatible)
PATCH — Bug fixes (backward compatible)

Examples:
  1.0.0         — First stable release
  1.1.0         — New feature added
  1.1.1         — Bug in new feature fixed
  2.0.0         — Breaking API change
  2.0.0-alpha.1 — Pre-release version
  2.0.0-rc.1    — Release candidate

When to increment:
  Given version 2.3.4:
    Fix a bug:                        → 2.3.5
    Add a new endpoint:               → 2.4.0
    Remove an existing endpoint:      → 3.0.0
    Change response format:           → 3.0.0 (breaking)
    Add optional field to response:   → 2.4.0 (backward compatible)
```

### Changelog Management

```markdown
# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

## [2.4.0] - 2025-03-15
### Added
- User profile image upload endpoint (`POST /users/:id/avatar`)
- Email verification flow for new registrations
- Rate limiting on authentication endpoints (10 req/min)

### Changed
- Improved error messages for validation failures (more specific)
- Updated dependencies: express 4.18.2 → 4.19.0

### Fixed
- Cart total calculation incorrect for EUR decimal amounts (#189)
- Password reset email not sent for accounts with unverified email (#201)

### Security
- Upgraded bcrypt to address CVE-2024-XXXXX
- Added Content Security Policy headers to all responses

## [2.3.5] - 2025-03-01
### Fixed
- [#178] Login fails for users with special characters in email

## [2.3.0] - 2025-02-15
### Added
- Two-factor authentication support
...
```

---

## ⚙️ CI/CD PIPELINE ARCHITECTURE

### Pipeline Stages

```
Trigger: Pull Request opened or updated
──────────────────────────────────────────────────────────────────

STAGE 1: Fast Feedback (< 2 minutes)
  ├── Lint (ESLint, Pylint, golangci-lint)
  ├── Type check (tsc --noEmit, mypy)
  ├── Dependency vulnerability scan (npm audit, safety)
  └── Commit message format check

STAGE 2: Testing (< 10 minutes)
  ├── Unit tests with coverage
  ├── Integration tests
  └── Contract tests (if applicable)

STAGE 3: Quality Gates (< 5 minutes)
  ├── Coverage threshold check (fail if < 80%)
  ├── Static analysis (SonarQube, CodeClimate)
  ├── Duplicate code detection
  └── Complexity threshold check

STAGE 4: Security (< 5 minutes, parallel with Stage 3)
  ├── SAST scan (Semgrep, CodeQL)
  ├── Secret detection (GitLeaks, TruffleHog)
  ├── Container image scan (if applicable)
  └── License compliance check

STAGE 5: Build
  ├── Production build
  ├── Docker image build + tag
  └── Build artifact upload

──────────────────────────────────────────────────────────────────
Trigger: Merge to develop / main
──────────────────────────────────────────────────────────────────

STAGE 6: Deploy to Environment
  ├── develop merge → staging environment
  ├── main merge    → production environment
  └── Database migrations (automated, backward compatible only)

STAGE 7: Post-Deploy Verification
  ├── Smoke tests (critical path only)
  ├── Health check validation
  └── Rollback trigger on failure (automatic)
```

### CI Configuration Example (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  COVERAGE_THRESHOLD: 80

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < ${{ env.COVERAGE_THRESHOLD }}" | bc -l) )); then
            echo "Coverage $COVERAGE% is below threshold ${{ env.COVERAGE_THRESHOLD }}%"
            exit 1
          fi
      - uses: codecov/codecov-action@v3

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - name: Secret detection
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
      - name: SAST scan
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript

  all-checks-pass:
    name: All Checks Pass
    needs: [lint-and-typecheck, unit-tests, security-scan]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Verify all jobs passed
        if: contains(needs.*.result, 'failure')
        run: exit 1
```

---

## 🚀 DEPLOYMENT STRATEGIES

### Deployment Pattern Selection Guide

```
RECREATE (Never use in production)
  Stop old version → deploy new version → all users affected
  Use for: Never (downtime)

ROLLING UPDATE (Default for most services)
  Gradually replace old instances with new ones
  Use for: Stateless services, minor changes
  Risk: Two versions running simultaneously

BLUE/GREEN (Recommended for critical services)
  Deploy new version alongside old → switch traffic atomically
  Use for: Major releases, database migrations
  Benefit: Instant rollback (just switch traffic back)
  Cost: 2x infrastructure during deployment

CANARY (Advanced — use for high-risk changes)
  Route 1-5% of traffic to new version → monitor → gradually increase
  Use for: Algorithm changes, performance-sensitive features
  Benefit: Validate in production with minimal blast radius
  Cost: More complex routing logic

FEATURE FLAGS (For long-running or risky features)
  Deploy code disabled → enable for subset of users → expand gradually
  Use for: A/B testing, gradual rollouts, kill switches
  Benefit: Separate deployment from release
```

### Rollback Protocol

```
AUTOMATIC ROLLBACK triggers:
  - Error rate increases > 2% (from baseline)
  - P95 latency increases > 50% (from baseline)
  - Health check failure for > 2 consecutive checks
  - Memory usage > 90% of limit

MANUAL ROLLBACK command:
  kubectl rollout undo deployment/<service-name>
  # Verify rollback:
  kubectl rollout status deployment/<service-name>

POST-ROLLBACK checklist:
  □ Verify error rates returned to baseline
  □ Check database integrity (no partially migrated state)
  □ Alert relevant stakeholders
  □ Open incident ticket documenting what happened
  □ Schedule post-mortem within 24 hours
```

---

## 🔒 GITIGNORE MASTER TEMPLATE

```gitignore
# ═══════════════════════════════════════════
# SECRETS & CREDENTIALS — NEVER COMMIT THESE
# ═══════════════════════════════════════════
.env
.env.local
.env.*.local
.env.production
*.pem
*.key
*.p12
*.pfx
secrets/
credentials/
*secret*
*credential*

# ═══════════════════════════════════════════
# DEPENDENCIES
# ═══════════════════════════════════════════
node_modules/
.npm
vendor/
__pycache__/
*.pyc
*.pyo
.venv/
venv/
env/
.Python
pip-log.txt

# ═══════════════════════════════════════════
# BUILD ARTIFACTS
# ═══════════════════════════════════════════
dist/
build/
out/
target/
*.class
*.jar
*.war
*.egg
*.whl

# ═══════════════════════════════════════════
# TEST ARTIFACTS
# ═══════════════════════════════════════════
coverage/
.coverage
*.lcov
.nyc_output/
htmlcov/
.pytest_cache/

# ═══════════════════════════════════════════
# IDE & EDITOR FILES
# ═══════════════════════════════════════════
.idea/
.vscode/
*.swp
*.swo
*.sublime-project
*.sublime-workspace
.DS_Store
Thumbs.db

# ═══════════════════════════════════════════
# LOGS & TEMP
# ═══════════════════════════════════════════
logs/
*.log
npm-debug.log*
yarn-debug.log*
tmp/
temp/
.tmp/

# ═══════════════════════════════════════════
# DOCKER
# ═══════════════════════════════════════════
docker-compose.override.yml
```

---

*Follow this workflow on every project. It is not optional.*
*The overhead is minimal. The protection it provides is invaluable.*
