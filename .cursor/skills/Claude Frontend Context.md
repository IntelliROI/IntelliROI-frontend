**Claude Frontend Context**

**Project Name**

Enterprise AI Intelligence Platform

**Purpose**

This document provides the context and engineering principles for building the frontend application.

It is **not** a technical specification.

It is **not** an implementation guide.

It explains **how the frontend should be designed**, **how features should be organized**, and **the engineering philosophy** that every generated code should follow.

Claude/Cursor should always treat this document as the source of truth before generating any code.

**Product Understanding**

This application is an Enterprise SaaS Platform.

Companies subscribe to this platform.

They onboard their organization.

Their employees use AI through our platform instead of directly using ChatGPT, Claude, or Gemini.

Our platform sits between the company and AI providers.

Every AI request is tracked, analyzed, enriched, and converted into business intelligence.

The frontend must always reflect this enterprise architecture.

**Product Vision**

The goal is NOT to build another AI Chat application.

The goal is to build the **Operating System for Enterprise AI Intelligence**.

Every screen should help organizations:

- Understand AI adoption.
- Monitor AI usage.
- Measure AI value.
- Improve governance.
- View executive insights.

Always think like an enterprise product, not a consumer application.

**Frontend Philosophy**

The frontend should be:

- Enterprise First
- Modular
- Scalable
- Feature Based
- Reusable
- Maintainable
- Strongly Typed
- Responsive
- Accessible
- Production Ready

Every generated code should follow these principles.

**Engineering Principles**

Always prefer:

- Reusable components
- Feature isolation
- Separation of concerns
- Small components
- Strong typing
- Clean architecture
- Consistent naming
- Composition over duplication

Never generate quick hacks.

Never tightly couple components.

Think long term.

**Folder Structure Philosophy**

Always organize by **feature**, not by file type.

Example

features/

analytics/

organization/

projects/

workspace/

roi/

Every feature owns its:

- Components
- Hooks
- Services
- Types
- API
- Validation
- Utilities

Avoid global business logic.

**API Philosophy**

The frontend should NEVER depend directly on backend APIs.

Instead, follow this flow:

Component

│

▼

Custom Hook

│

▼

Service

│

▼

Repository

│

▼

API Client

│

▼

Environment Configuration

The UI must never know backend URLs.

**Mock First Development**

Until the backend is ready:

UI

↓

Dummy JSON

↓

Mock Service

↓

Repository

↓

Frontend Complete

When backend APIs become available:

Replace only the Repository/API implementation.

The UI should require **zero changes**.

This is a mandatory architectural rule.

**State Management**

Use local state whenever possible.

Use global state only for:

- Authentication
- User Profile
- Organization
- Theme
- Notifications

Everything else should come from server state.

Prefer React Query for server data.

Prefer Zustand for lightweight global state.

**Dashboard Philosophy**

Every role has a different dashboard.

Never reuse dashboards across roles.

Super Admin

Platform overview.

CEO

Company overview.

Department Manager

Department overview.

Team Lead

Team overview.

Employee

Personal dashboard.

Always show only the information relevant to that role.

**Component Philosophy**

Components should be:

- Small
- Independent
- Reusable
- Testable

Large pages should be composed of many smaller components.

Avoid components with multiple responsibilities.

**Layout Philosophy**

Layouts should be reusable.

Examples:

- Authentication Layout
- Dashboard Layout
- Organization Layout
- Settings Layout
- Public Layout

Do not duplicate layout code.

**Navigation Philosophy**

Navigation should be generated from permissions.

Never hardcode menus for different users.

Sidebar items should depend on:

Role

↓

Permissions

↓

Enabled Modules

↓

Organization Features

This keeps the application scalable.

**UI Philosophy**

The interface should feel like:

- Stripe
- Linear
- Vercel
- Microsoft
- Google Cloud
- Datadog

Characteristics:

- Minimal
- Premium
- Modern
- Data First
- Professional

Avoid flashy consumer-style interfaces.

**Coding Standards**

Always write:

- Clean code
- Readable code
- Typed code
- Reusable code

Avoid:

- Magic strings
- Large files
- Repeated logic
- Hardcoded URLs
- Inline business logic

**Naming Standards**

Use consistent naming.

Examples:

Feature names

Organization

Analytics

Workspace

Projects

Components

EmployeeCard

DepartmentTable

AnalyticsChart

Hooks

useEmployees

useProjects

useAnalytics

Services

EmployeeService

ProjectService

AnalyticsService

Repositories

EmployeeRepository

ProjectRepository

AnalyticsRepository

**Future Ready**

Design every feature so future modules can be added without major refactoring.

Future integrations include:

- Jira
- GitHub
- Azure DevOps
- Slack
- Microsoft Teams
- HRMS
- CRM
- ERP

Do not tightly couple the architecture to the MVP.

**Claude/Cursor Instructions**

Whenever generating frontend code:

1. Think like a Senior Frontend Architect.
2. Follow enterprise engineering standards.
3. Keep components reusable.
4. Keep business logic outside UI components.
5. Follow feature-based architecture.
6. Use mock services before backend integration.
7. Never hardcode backend URLs.
8. Write scalable and maintainable code.
9. Optimize for long-term growth.
10. Generate code that a new developer can easily understand.

**Final Objective**

The objective is not simply to build a working frontend.

The objective is to build an enterprise-grade platform that can scale from one company to thousands of organizations without requiring architectural redesign.

Every design decision should prioritize:

- Scalability
- Maintainability
- Reusability
- Performance
- Developer Experience
- Long-Term Product Growth

This document should be treated as the guiding philosophy for every frontend feature generated throughout the project.