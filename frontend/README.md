# Frontend — React 19 + Vite

POS & Inventory frontend for **Vat' Milktea**.

## Tech Stack

- **React 19** + **Vite**
- **React Router 7** (react-router-dom)
- **Zustand** for state management
- **Axios** for API calls (Laravel backend on `http://localhost:8000/api`)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Roles

The system has two roles:

- **Admin** — full dashboard: analytics, menu management, order history, staff directory.
- **Cashier / Staff** — POS counter: browse menu, build cart, process orders.

Quick-fill test accounts on the login page:

| Role           | Email            | Password    |
| -------------- | ---------------- | ----------- |
| Admin          | admin@cafe.com   | password123 |
| Cashier/Staff  | user@cafe.com    | password123 |

## Structure

```
src/
├── main.jsx              React entry point
├── App.jsx               Root layout (Outlet)
├── router/index.jsx      React Router config + guards
├── stores/auth.js        Zustand auth store
├── services/             Axios API services
└── views/                Login, Register, Welcome (POS), Dashboard
```
