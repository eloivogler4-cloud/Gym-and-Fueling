# Architecture and Design Decisions

This document explains the reasoning and decisions behind the project structure created in this repo.

Principles followed
- Single Responsibility: each module has a focused responsibility (User, Workout, Progress, AI Coach, Exercise DB).
- Separation of concerns: domain models + business logic live in `src/core` and `src/modules/*`; UI and presentation should live under `src/ui`.
- Portability: Business logic is written in pure TypeScript (no DOM or platform APIs) so it can be reused on the web and in React Native or other mobile targets later.
- Modularity & explicit boundaries: each module exposes Ports (interfaces) and Repositories/Services. This makes replacing implementations (e.g., migrate from in-memory to SQLite/Realm/remote API) trivial.
- Minimal complexity: only essential files and interfaces are created. Implementations are intentionally simple stubs.

Project layout (important folders)
- src/
  - core/
    - models/  -- domain types (User, Workout, Progress, Exercise)
    - ports/   -- interfaces for repositories/services
    - storage/ -- simple storage abstraction and in-memory implementation
  - modules/
    - user/
    - workout/
    - progress/
    - aiCoach/
    - exerciseDb/
    - future/  -- placeholders for Friends, Messaging, Nutrition, Supplements
  - ui/
    - components/ -- (empty) UI components and screens
  - utils/ -- small helpers
  - app.ts -- small bootstrap demonstrating wiring of modules

How this helps future iOS conversion
- Keep business logic platform-agnostic and small surface area to port.
- If future iOS app is written in Swift/SwiftUI, the domain models and business rules documented here will map directly to Swift models and services.
- Alternatively, this core can be re-used with React Native for faster cross-platform launch.

What's intentionally omitted
- No UI implementation beyond directory placeholders.
- No external infra (databases, remote APIs). Use ports so infra can be added later.
- No heavy frameworks. We keep dependencies minimal and explicit.

Next steps
- Add unit tests for core business logic.
- Add persistent storage adapter (SQLite / local storage / cloud sync).
- Start implementing specific features (e.g., Workout Plan CRUD) inside modules.
