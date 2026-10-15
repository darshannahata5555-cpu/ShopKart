# ShopKart MERN Project

ShopKart is a beginner-friendly full-stack shopping application built with MongoDB, Express, React, and Node.js.

## Features

- Customer registration, login, profile, and logout
- JWT authentication using an HttpOnly cookie
- Product catalogue with search, category filtering, sorting, and details
- Persistent customer wishlist
- Persistent shopping cart with quantity and stock validation
- Shared React cart state and derived subtotal/cart count
- Checkout with shipping validation and Razorpay Test Mode
- Payment signature verification and persistent order history
- Loading, empty, and error states

## Project structure

```text
backend/
  controllers/   Request and business logic
  middlewares/   Authentication checks
  models/        MongoDB document shapes
  routes/        API endpoint definitions

frontend/src/
  components/    Reusable interface pieces
  context/       Shared authentication and cart state
  pages/         Route-level screens
  services/      Shared Axios configuration
  utils/         Small reusable functions
```

## 1. Configure the backend

Create `backend/.env` using `backend/.env.example` as a guide:

```env
PORT=8084
DB_URL=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Generate the last two values in a Razorpay account with **Test Mode enabled**. Never place the Key Secret in the frontend or commit `backend/.env`.

## 2. Install and seed

```powershell
cd backend
npm install
npm run seed
```

The seed command adds eight sample products only when the Product collection is empty. It never deletes existing products.

## 3. Run the backend

```powershell
cd backend
npm run dev
```

The API runs at `http://localhost:8084`.

## 4. Run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, register an account, and sign in.

## Main API routes

| Method | Endpoint | Authentication | Purpose |
|---|---|---:|---|
| POST | `/customers/register` | No | Create account |
| POST | `/customers/login` | No | Log in |
| GET | `/customers/me` | Yes | Restore session/profile |
| POST | `/customers/logout` | Yes | Log out |
| POST | `/products` | No | Create product |
| GET | `/products` | No | Search/filter products |
| GET | `/products/:id` | No | Get product details |
| POST | `/wishlist/:productId` | Yes | Save product |
| GET | `/wishlist` | Yes | Get customer's wishlist |
| DELETE | `/wishlist/:productId` | Yes | Remove saved product |
| POST | `/cart/:productId` | Yes | Add/increment cart item |
| GET | `/cart` | Yes | Get customer's cart |
| PATCH | `/cart/:productId` | Yes | Change quantity |
| DELETE | `/cart/:productId` | Yes | Remove cart item |
| POST | `/orders/create-payment-order` | Yes | Validate cart and start Test Mode payment |
| POST | `/orders/verify-payment` | Yes | Verify payment and place order |
| GET | `/orders` | Yes | Get customer's orders |
| GET | `/orders/:id` | Yes | Get one owned order |

## Important concepts

- Routes decide which controller handles a request.
- Controllers validate input and perform business logic.
- Models define how MongoDB stores data.
- Middleware protects routes before a controller runs.
- Wishlist and cart store Product references rather than copied product data.
- `populate()` replaces those references with current Product documents.
- Cart subtotal and item count are calculated from cart state, not stored.
- Order items snapshot purchase-time names and prices so history remains accurate.
- The backend calculates the checkout total and verifies the Razorpay signature.
