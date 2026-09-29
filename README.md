# Scroll & Shop — Social E-Commerce Platform

**Scroll & Shop** is an Amazon-style e-commerce platform enhanced with social networking, product discussions, creator short videos, friend recommendations, real-time chat, and seamless gift giving.

---

## 🚀 Key Highlights & Architecture

- **Frontend**: React 19, TypeScript, Vite, React Router 7, Axios, WebSocket (@stomp/stompjs + SockJS), Canvas Confetti, and a custom CSS design system.
- **Backend**: Java 21 / Spring Boot 3.3.4, Spring Security, JWT (HMAC-SHA256), Spring Data JPA, Hibernate, WebSocket STOMP broker, Bean Validation.
- **Database**: MySQL 8.0 with Flyway SQL migrations (`V1__initial_schema.sql`, `V2__seed_data.sql`) and dynamic startup bootstrap data (`DataInitializer.java`). H2 in-memory profile supported for unit and integration testing.
- **Payments**: Razorpay test mode integration with server-side order creation and cryptographic HMAC-SHA256 signature verification.
- **Media**: Cloudinary SDK integration with image/video validation and fallback mode.
- **Personalization Engine**: Transparent, rule-based product recommendation algorithm with configurable weights (VIEW: 1.0, LIKE: 2.5, SAVE: 3.0, SHARE: 3.5, PURCHASE: 5.0), recency decay calculation, and strict privacy controls (does **not** inspect private chats; honors user opt-out).

---

## 📦 Project Structure

```
MODERN_ECOMMERCE/
├── backend/
│   ├── src/main/java/com/scrollshop/
│   │   ├── config/             # SecurityConfig, JwtTokenProvider, WebSocketConfig, RazorpayConfig, CloudinaryConfig
│   │   ├── controller/         # Auth, Product, Cart, Order, Payment, Social, Chat, Video, Gift, Admin
│   │   ├── dto/                # Request & Response DTOs
│   │   ├── entity/             # JPA Entities (User, Product, Order, Payment, Friend, Video, Wishlist)
│   │   ├── exception/          # GlobalExceptionHandler and Custom Exceptions
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   └── service/            # Business Logic & Algorithms (Pricing, Recommendations, Signatures)
│   ├── src/main/resources/
│   │   ├── db/migration/       # V1__initial_schema.sql, V2__seed_data.sql
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   └── application-test.yml
│   └── src/test/java/com/scrollshop/ # Automated Unit and Integration Tests
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, CategoryBar, HeroBanner, ProductCard, VideoPlayer, Modals, Footer
│   │   ├── context/            # AuthContext, CartContext, SocialContext
│   │   ├── pages/              # Home, Search, ProductDetail, Cart, Checkout, Orders, Friends, Chat, Videos, Gift, Wishlist, Admin, Login, Register, Profile
│   │   ├── services/           # Axios API Client & WebSocket STOMP Client
│   │   ├── styles/             # Design System & Component CSS
│   │   └── types/              # TypeScript Models
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example                # Root environment template
└── README.md
```

---

## 🛠️ Quick Start & Setup Instructions

### 1. Database Setup (MySQL)
Ensure MySQL 8.0 is running locally (e.g. `MYSQL80` service on Windows).

Create the database:
```sql
CREATE DATABASE IF NOT EXISTS scroll_shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
Copy environment configurations:
```powershell
cp .env.example backend/.env
```

Run tests to verify backend compilation:
```powershell
cd backend
mvn test
```

Start the Spring Boot backend on `http://localhost:8080`:
```powershell
mvn spring-boot:run
```

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Containerized Deployment (Docker & Docker Compose)

Deploy the entire full-stack application (MySQL 8, Spring Boot Backend API, and Nginx-powered React Frontend) with a single command:

```powershell
# Start all containers in the background
docker compose up -d --build

# View container logs
docker compose logs -f

# Verify service health
curl http://localhost/api/health
```

- **Frontend App**: `http://localhost/` (Port 80)
- **Backend API**: `http://localhost:8080/api` (Port 8080)
- **Health Check**: `http://localhost:8080/api/health`
- **MySQL Database**: `localhost:3306`


## 🔑 Demo Accounts & Credentials

All default seed accounts use the password: `Password@123`

| Username | Role | Description |
|---|---|---|
| `admin` | **ADMIN** | Full administrative access, metrics dashboard, order status switcher, inventory stock editor |
| `alex_tech` | **CREATOR** | Creator with shoppable video reviews (ANC Headphones, Nomad Keyboard) |
| `sarah_style` | **CREATOR** | Creator with home/lifestyle videos (Morning Coffee Ritual) |
| `rohit_gamer` | **USER** | Gaming and mechanical keyboard enthusiast |
| `priya_art` | **USER** | Art, lifestyle, and decor shopper |

*Note: You can also use the 1-click Fast Demo Logins directly on the Login page.*

---

## 🛍️ Implemented Features Matrix

| Feature Domain | Capabilities & Implementation Status |
|---|---|
| **1. Authentication** | ✅ Registration, Login, Logout, JWT Token issuance & validation, BCrypt password hashing, profile management, protected routes. |
| **2. Shopping Experience** | ✅ Amazon-style homepage, deals carousel, faceted search, category navigation, high-res gallery detail page, stock validation, reviews. |
| **3. Social Profiles** | ✅ User search, send/accept/reject friend requests, remove friends, block/unblock users, mutual friendships. |
| **4. Product Interactions** | ✅ Likes, threaded discussions, comments with replies, "Discuss with Friends" modal. |
| **5. Live Chat** | ✅ Direct and group messaging, interactive shoppable product card attachments, WebSocket distribution broker. |
| **6. Video Shopping** | ✅ TikTok/Reels style vertical short-video feed, creator badges, likes/views counters, shoppable product tag overlays, creator upload modal. |
| **7. Recommendations** | ✅ Transparent rule-based algorithm (weights: VIEW, LIKE, SAVE, SHARE, PURCHASE) with recency decay. Respects privacy toggle. |
| **8. Gift Your Friend** | ✅ Pick a friend, view their public wishlist, algorithmic gift suggestions, custom greeting message, gift wrapping options, verified gift order. |
| **9. Gift Wishlist** | ✅ Personal gift wishlist, Public/Private toggle per item, reservation state to prevent duplicate gifts from friends. |
| **10. Admin Portal** | ✅ Protected role-based admin dashboard, real-time metrics (revenue, orders, users, videos), order status management, inventory editor. |
| **11. Payments & Orders** | ✅ Server-calculated totals from trusted DB, inventory deduction, Razorpay test mode order creation and HMAC-SHA256 signature verification. |

## 📡 REST API Reference

| Domain | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Products** | `GET` | `/api/products` | Public | Paged product search with filters (q, categoryId, minPrice, maxPrice, sortBy, sortDir) |
| | `GET` | `/api/products/{id}` | Public | Detailed product data with images and current user like status |
| | `GET` | `/api/products/featured` | Public | Featured products list |
| | `GET` | `/api/products/deals` | Public | Limited-time deals of the day |
| | `GET` | `/api/products/categories` | Public | All product categories |
| | `POST` | `/api/products/{id}/like` | Auth | Toggle like on product |
| | `DELETE` | `/api/products/{id}/like` | Auth | Remove like from product |
| | `GET` | `/api/products/{id}/likes` | Public | Get like counter and user like status |
| | `GET` | `/api/products/{id}/reviews` | Public | Get product customer reviews |
| | `POST` | `/api/products/{id}/reviews` | Auth | Submit verified customer review (1-5 stars) |
| | `PUT` | `/api/products/{id}/reviews/{reviewId}` | Auth | Edit own customer review |
| | `DELETE` | `/api/products/{id}/reviews/{reviewId}` | Auth | Delete own customer review |
| | `GET` | `/api/products/{id}/comments` | Public | Get threaded product discussions |
| | `POST` | `/api/products/{id}/comments` | Auth | Post product comment or reply |
| | `PUT` | `/api/products/{id}/comments/{commentId}` | Auth | Edit own discussion comment |
| | `DELETE` | `/api/products/{id}/comments/{commentId}` | Auth | Delete own discussion comment |
| **Cart** | `GET` | `/api/cart` | Auth | Get current user's cart summary with subtotal and taxes |
| | `POST` | `/api/cart/items` | Auth | Add product to cart with quantity validation |
| | `PUT` | `/api/cart/items/{itemId}` | Auth | Update cart item quantity |
| | `DELETE` | `/api/cart/items/{itemId}` | Auth | Remove single item from cart |
| | `DELETE` | `/api/cart` | Auth | Clear entire cart |
| **Wishlist** | `GET` | `/api/wishlist` | Auth | Get current user's wishlist |
| | `POST` | `/api/wishlist/{productId}` | Auth | Add product to wishlist |
| | `DELETE` | `/api/wishlist/{productId}` | Auth | Remove product from wishlist |
| **Orders** | `POST` | `/api/orders` | Auth | Create order with trusted server pricing and stock deduction |
| | `GET` | `/api/orders` | Auth | Get authenticated user's order history |
| | `GET` | `/api/orders/{orderId}` | Auth | Get single order (owner or admin only) |
| | `GET` | `/api/orders/gifts-received` | Auth | Get list of gift orders received from friends |
| **Payments** | `POST` | `/api/payments/create-order/{orderId}` | Auth | Create Razorpay order with server-verified amount |
| | `POST` | `/api/payments/verify` | Auth | Cryptographic HMAC-SHA256 signature verification |
| | `POST` | `/api/payments/webhook` | Public | Idempotent webhook event processor with secret verification |
| **Admin** | `GET` | `/api/admin/stats` | Admin | Overall revenue, order, product, and user analytics |
| | `GET` | `/api/admin/orders` | Admin | Paged order management list |
| | `PATCH` | `/api/admin/orders/{orderId}/status`| Admin | Update order lifecycle status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED) |
| | `GET` | `/api/admin/users` | Admin | List all registered platform users |
| | `PATCH` | `/api/admin/users/{userId}/role` | Admin | Update user role (USER, CREATOR, ADMIN) |
| | `POST` | `/api/admin/products` | Admin | Create new product |
| | `PUT` | `/api/admin/products/{id}` | Admin | Update existing product details |
| | `PATCH` | `/api/admin/products/{id}/stock` | Admin | Update product stock count |
| | `DELETE` | `/api/admin/products/{id}` | Admin | Delete product |

---

## 🧪 Running Automated Tests

Run all unit and integration tests across Auth, Pricing, Stock Checks, Cart, and Razorpay signature verification:
```powershell
cd backend
mvn test
```

Run frontend production build validation:
```powershell
cd frontend
npm run build
```

---

## 🔧 Troubleshooting

- **MySQL Connection Refused**: Verify MySQL 8 service is started (`Get-Service MYSQL*` on Windows) and `SPRING_DATASOURCE_PASSWORD` in your `.env` or `application-dev.yml` matches your local root password.
- **CORS Issues**: Ensure `APP_CORS_ALLOWED_ORIGINS` in `application.yml` contains your frontend dev origin (default: `http://localhost:5173`).
- **Offline / Standalone Mode**: The frontend includes a local storage and mock fallback engine, enabling full browsing, cart updates, and gifting flows even when the backend database is offline.

