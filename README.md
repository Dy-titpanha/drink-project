# Vat' Milktea — POS & Inventory Management System

A Point of Sale (POS) and inventory management web application for **Vat' Milktea**.

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [Zustand](https://zustand.docs.pmnd.rs/) + [React Router](https://reactrouter.com/) + [Axios](https://axios-http.com/)
- **Backend**: [PHP Laravel 13](https://laravel.com/) + [Laravel Sanctum](https://laravel.com/docs/sanctum) + **PostgreSQL** + Telegram Bot Notifications

> ⚠️ **PHP 8.4 required.** This project uses Laravel 13 / Symfony 8.1 which need **PHP >= 8.4** (property hooks). Your default PHP 8.2 will throw `syntax error ... in Request.php line 117`. Use the bundled PHP 8.4 from WAMP: `C:\wamp\bin\php\php8.4.0\php.exe`.

---

## 🚀 Getting Started

### Prerequisites
- **PHP** >= 8.4 & **Composer** (WAMP includes `php8.4.0`)
- **Node.js** >= 18 & **npm**
- **PostgreSQL** Database (`syscofe`)

---

### Quick Start (recommended)

Double-click `start.bat` (or run `powershell -File start.ps1` from the repo root). It launches:

- Laravel backend → `http://localhost:8000` (using PHP 8.4)
- React frontend → `http://localhost:5173`

---

### 1. Backend Setup (PHP Laravel)

```bash
cd backend

# Install dependencies (if needed)
composer install

# Configure Environment
# backend/.env already uses PostgreSQL:
#   DB_CONNECTION=pgsql
#   DB_DATABASE=syscofe
#   DB_USERNAME=root
#   DB_PASSWORD=12345

# Run Database Migrations + Seeders (PHP 8.4!)
C:\wamp\bin\php\php8.4.0\php.exe artisan migrate:fresh --seed

# Start Laravel Dev Server (port 8000) with PHP 8.4
C:\wamp\bin\php\php8.4.0\php.exe artisan serve --host=127.0.0.1 --port=8000
```

The API will be live at `http://localhost:8000/api`.

---

### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite Dev Server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 👥 Roles

The system supports two roles:

- **Admin** — analytics overview, menu management, order history, staff directory (Dashboard at `/dashboard`).
- **Cashier / Staff** — POS counter: live menu search, category filters, cart, QR payment, checkout.

Quick-fill login presets: `admin@cafe.com` (Admin) and `user@cafe.com` (Cashier/Staff), both `password123`.

---

## 📱 Features

- **POS Counter Screen**:
  - Live menu item search & category filters (Milktea, Coffee, Tea)
  - Interactive shopping cart with quantity adjustment
  - Automatic QR Code Payment modal
  - Instant order receipt confirmation
- **Admin Dashboard**:
  - Real-time revenue metrics, menu item count, completed orders, and cashier list
  - Drink menu management (Create, Edit, Delete, Category assignment)
  - Order history log
  - Cashier & staff directory
- **Telegram Bot Integration**:
  - Automatically posts order receipts to a Telegram channel upon checkout completion.
