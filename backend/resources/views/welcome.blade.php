<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Cafe & Milk Tea - API & Swagger Hub</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
            background: #0f172a;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        }

        .container {
            max-width: 900px;
            width: 100%;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #334155;
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
        }

        .badge {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
        }

        h1 {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.subtitle {
            color: #94a3b8;
            margin-top: 0.25rem;
            font-size: 1rem;
        }

        .hero-btn-container {
            margin: 2rem 0;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn-swagger {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-weight: 700;
            font-size: 1.125rem;
            padding: 1rem 2rem;
            border-radius: 12px;
            text-decoration: none;
            box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-swagger:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.6);
        }

        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #334155;
            color: #f8fafc;
            font-weight: 600;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            text-decoration: none;
            border: 1px solid #475569;
            transition: background 0.2s ease;
        }

        .btn-secondary:hover {
            background: #475569;
        }

        .card {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 14px;
            padding: 1.5rem;
            margin-top: 1.5rem;
        }

        .card h2 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            color: #38bdf8;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0.5rem;
        }

        th, td {
            text-align: left;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #1e293b;
        }

        th {
            color: #94a3b8;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
        }

        td code {
            background: #1e293b;
            color: #38bdf8;
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
            font-family: monospace;
        }

        .role-pill {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .role-admin { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
        .role-staff { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
        .role-customer { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }

        footer {
            margin-top: 2rem;
            text-align: center;
            color: #64748b;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>System Cafe & Milk Tea API</h1>
                <p class="subtitle">Laravel Backend & OpenAPI Swagger Documentation</p>
            </div>
            <span class="badge">● Server Active</span>
        </div>

        <p style="color: #cbd5e1; font-size: 1.05rem;">
            Welcome! The backend API is running. Click below to open and test interactive endpoints in <strong>Swagger UI</strong>:
        </p>

        <div class="hero-btn-container">
            <a href="/api/documentation" class="btn-swagger">
                🚀 Open Swagger Documentation
            </a>
            <a href="/api/health" target="_blank" class="btn-secondary">
                🔍 Check API Health
            </a>
        </div>

        <div class="card">
            <h2>🔑 Test Login Accounts (password123)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Permissions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="role-pill role-admin">Admin</span></td>
                        <td><code>admin@cafe.com</code></td>
                        <td><code>password123</code></td>
                        <td>Full System Access, Revenue & Stats</td>
                    </tr>
                    <tr>
                        <td><span class="role-pill role-staff">User (Staff)</span></td>
                        <td><code>user@cafe.com</code></td>
                        <td><code>password123</code></td>
                        <td>Products View/Create, POS Orders</td>
                    </tr>
                    <tr>
                        <td><span class="role-pill role-customer">Customer</span></td>
                        <td><code>customer@cafe.com</code></td>
                        <td><code>password123</code></td>
                        <td>Browse Drinks, Customer Checkout</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <footer>
            <p>System Cafe & Milk Tea • Laravel Backend • Swagger OpenAPI v3</p>
        </footer>
    </div>
</body>
</html>
