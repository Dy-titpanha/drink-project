import React from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.js'

import LoginView from '../views/LoginView.jsx'
import RegisterView from '../views/RegisterView.jsx'
import WelcomeView from '../views/WelcomeView.jsx'
import DashboardView from '../views/DashboardView.jsx'
import EZOrderView from '../views/EZOrderView.jsx'
import App from '../App.jsx'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)

  if (!token) return <Navigate to="/login" replace />
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />
  
  return children
}

const GuestRoute = ({ children }) => {
  const token = useAuthStore(state => state.token)
  if (token) return <Navigate to="/" replace />
  return children
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <GuestRoute><LoginView /></GuestRoute>
      },
      {
        path: "register",
        element: <GuestRoute><RegisterView /></GuestRoute>
      },
      {
        index: true,
        element: <ProtectedRoute><WelcomeView /></ProtectedRoute>
      },
      {
        path: "dashboard",
        element: <ProtectedRoute requireAdmin><DashboardView /></ProtectedRoute>
      },
      {
        // Public scan-to-order page opened by the EZorder table QR code
        path: "ezorder",
        element: <EZOrderView />
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
])
