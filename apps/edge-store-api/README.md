# Edge Store API

Backend API for the Edge Store application. Built with Node.js, Express, TypeScript, and MySQL.

## Prerequisites

- Node.js v22.13+
- pnpm
- MySQL 8.0+

## Installation

1. **Install dependencies**
   ```bash
   pnpm install

2. Configure database
  ```bash
  cp config/database.example.json config/database.json

3. Configure environment
  ```bash
  cp .env.example .env

4. Create database
  ```bash 
  pnpm db:setup
  pnpm db:migrate
  pnpm db:seed

  NOTE: If NODE_ENV is set to production, seeds won't run automatically. Force them with: ```RUN_SEEDS=true pnpm db:setup```


5. Run migrations
  ```bash
  pnpm migrate

  Database Migrations
  # Run migrations
  pnpm migrate

  # Rollback last migration
  pnpm migrate:rollback

  # Create new migration
  pnpm migrate:make migration_name

6. Start development server
  ```bash
  pnpm dev

7. Build
  ```bash 
  pnpm build