<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "System Cafe & Milk Tea API Documentation",
    description: "Welcome to the **System Cafe & Milk Tea POS API Documentation**!

### 🔑 Available Test Login Accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cafe.com` | `password123` | Full access (Products, Orders, Admin Dashboard Stats, Manage Users) |
| **User (Staff)** | `user@cafe.com` | `password123` | Staff access (Products view/create, Checkout Orders) |
| **Customer** | `customer@cafe.com` | `password123` | Customer access (Browse Menu, Place Orders, Profile management) |

---
### 🛡️ How to Authenticate:
1. Call **`POST /api/auth/login`** with one of the test accounts above.
2. Copy the returned `token` from the response.
3. Click the **Authorize** button at the top right of this Swagger UI page.
4. Paste the token into the **Value** box and click **Authorize**.
"
)]
#[OA\Server(
    url: "/",
    description: "Current Server (Relative)"
)]
#[OA\Server(
    url: "http://127.0.0.1:8000",
    description: "Local 127.0.0.1 Server"
)]
#[OA\Server(
    url: "http://localhost:8000",
    description: "Localhost Server"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    name: "Authorization",
    in: "header",
    scheme: "bearer",
    bearerFormat: "Sanctum Token"
)]
class SwaggerController extends Controller
{
    // Base Swagger metadata definition controller
}
