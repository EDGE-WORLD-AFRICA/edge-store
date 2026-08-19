# Edge Store API

Backend API for the Edge Store application. Built with Node.js, Express, TypeScript, and MySQL.

## Prerequisites

- Node.js v18+
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
or 
  ```CREATE DATABASE edge_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;```

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