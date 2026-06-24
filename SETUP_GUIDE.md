# 🚀 E-Commerce Full Stack - Setup Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Email Configuration](#email-configuration)
6. [Features Overview](#features-overview)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Project Overview

This is a full-stack e-commerce application with:
- **Backend:** Node.js + Express.js + MongoDB
- **Frontend:** React + Vite
- **Authentication:** JWT
- **Email Notifications:** Automated emails for orders and password operations
- **Admin Dashboard:** Complete admin panel for managing orders, products, categories

### Current Features ✨
- ✅ User Authentication (Register, Login, Logout)
- ✅ Forgot Password with Email Reset Link
- ✅ Change Password (Authenticated Users)
- ✅ Password Reset Confirmation Email
- ✅ Order Placement with Email Confirmation
- ✅ Admin Panel with Order & Product Management
- ✅ Product Reviews & Ratings
- ✅ Wishlist Functionality
- ✅ Image Upload with ImageKit
- ✅ Responsive UI

---

## Prerequisites

### Required Software
```bash
# Check if installed:
node --version      # Should be v14+
npm --version       # Should be v6+
git --version
```

### Required Accounts
1. **MongoDB Atlas Account**
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string

2. **SMTP Service Account** (Choose any one)
   - Brevo: https://www.brevo.com/ (Recommended)
   - Gmail: https://accounts.google.com/
   - Mailtrap: https://mailtrap.io/
   - Others listed in .env.example

3. **ImageKit Account** (Optional, for image uploads)
   - Sign up: https://imagekit.io/
   - Create API keys

---

## Backend Setup

### Step 1: Clone & Navigate
```bash
git clone <repository-url>
cd Backend/EcomBackend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the Backend/EcomBackend directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in the values:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Admin Credentials
ADMIN_USERNAME=admin123
ADMIN_PASSWORD=admin@password123

# Image Upload (ImageKit)
IMAGEKIT_PRIVATE_KEY=your_key_here
IMAGEKIT_PUBLIC_KEY=your_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email Configuration (Choose ONE option)
# Using Brevo (Recommended):
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_username
SMTP_PASS=your_brevo_password
SMTP_FROM=your_email@example.com
APP_NAME=ShopZen
```

### Step 4: MongoDB Setup

1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Get connection string:
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string
   - Replace `<password>` with your database password

### Step 5: Start Backend Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

**Expected Output:**
```
Server running on port 3000
MongoDB connected successfully
```

---

## Frontend Setup

### Step 1: Navigate to Frontend
```bash
cd frontend/InterEcomFront
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration

Create `.env` file in frontend directory:

```bash
# Default API URL for development
VITE_API_URL=http://localhost:3000
```

### Step 4: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  Local:        http://localhost:5173/
```

---

## Email Configuration

### Option 1: Brevo (Recommended - 300 free emails/day)

#### Step 1: Create Account
1. Go to https://www.brevo.com/
2. Click "Sign up for free"
3. Enter your email and create account
4. Verify your email

#### Step 2: Get SMTP Credentials
1. Log in to Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Under "SMTP", you'll see:
   - SMTP Login
   - SMTP Password
4. Copy these credentials

#### Step 3: Add Verified Sender Email
1. Go to **Senders** in left menu
2. Click **Add a sender**
3. Enter your email address (must be able to verify)
4. Check email and verify the sender
5. Use this email in `SMTP_FROM`

#### Step 4: Update .env
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login
SMTP_PASS=your_brevo_password
SMTP_FROM=your_verified_email@example.com
```

### Option 2: Gmail (Unlimited - Requires 2FA)

#### Step 1: Enable 2-Factor Authentication
1. Go to myaccount.google.com
2. Click **Security** in left menu
3. Under "How you sign in to Google"
4. Enable **2-Step Verification**

#### Step 2: Create App Password
1. Go to myaccount.google.com/apppasswords
2. Select App: **Mail**
3. Select Device: **Windows Computer** (or your device)
4. Generate password (16 characters)
5. Copy the password

#### Step 3: Update .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=your_email@gmail.com
```

### Option 3: Mailtrap (For Testing - 500 emails/month free)

#### Step 1: Create Account
1. Go to https://mailtrap.io/
2. Sign up with email
3. Verify email

#### Step 2: Get Credentials
1. Click on your inbox
2. Click **Settings** tab
3. Copy SMTP credentials

#### Step 3: Update .env
```env
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM=your_email@example.com
```

### Testing Email Without SMTP (Development Only)

If you want to test without setting up SMTP:

1. Leave SMTP fields empty in .env
2. Reset links will be returned in API responses
3. Check console logs for details

**Example Response:**
```json
{
  "success": true,
  "resetLink": "http://localhost:5173/reset-password/abc123..."
}
```

---

## Features Overview

### 1. Authentication

#### Register
```
POST /signin
Body: { name, email, password }
Response: { success, user, token }
```

#### Login
```
POST /login
Body: { email, password }
Response: { success, user, token }
```

#### Get Profile
```
GET /profile
Headers: { Authorization: Bearer token }
Response: { success, user }
```

### 2. Password Management

#### Forgot Password (No Login Required)
```
POST /forgot-password
Body: { email }
Response: { success, message }
Email: Contains reset link
```

#### Reset Password (Using Reset Link)
```
POST /reset-password/:token
Body: { password }
Response: { success, message }
Email: Password change confirmation
```

#### Change Password (Requires Login)
```
PUT /change-password
Headers: { Authorization: Bearer token }
Body: { currentPassword, newPassword }
Response: { success, message }
Email: Password change confirmation
```

### 3. Orders

#### Place Order
```
POST /orders
Body: { items, address, paymentMethod, userId }
Response: { success, order }
Email: Order confirmation with details
```

#### Get User Orders
```
GET /orders/user/:userId
Response: { success, orders }
```

#### Admin: Get All Orders
```
GET /orders
Headers: { Authorization: Bearer token }
Response: { success, orders }
```

### 4. Products

#### Get All Products
```
GET /products
Response: { success, products, total, pages }
```

#### Get Product by ID
```
GET /products/:id
Response: { success, product }
```

#### Create Product (Admin Only)
```
POST /products
Headers: { Authorization: Bearer token }
Body: { Product_name, price, description, category, stock, image }
Response: { success, product }
```

---

## Running the Application

### Terminal Setup

**Terminal 1 - Backend:**
```bash
cd Backend/EcomBackend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/InterEcomFront
npm run dev
# Runs on http://localhost:5173
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Admin Panel:** http://localhost:5173/admin (Login with admin credentials)

---

## Testing

### Test User Registration & Login

1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in details:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123 (min 8 chars)
4. Click "Register"
5. You should be logged in automatically

### Test Forgot Password

1. Click "Login"
2. Click "Forgot Password"
3. Enter your email
4. Check your email for reset link
5. Click the link
6. Enter new password
7. You should get confirmation email

### Test Change Password

1. Log in with your account
2. Go to Profile/Settings
3. Click "Change Password"
4. Enter current and new password
5. Click "Change"
6. You should get confirmation email

### Test Order Placement

1. Log in to the application
2. Add products to cart
3. Go to checkout
4. Fill delivery address
5. Select payment method
6. Click "Place Order"
7. Check email for order confirmation

### Test Admin Panel

1. Go to http://localhost:5173/admin
2. Login with:
   - Username: admin123
   - Password: admin@password123
3. You can now manage orders and products

---

## Environment Variables Reference

```env
# MongoDB
MONGO_URI=<connection-string>

# Authentication
JWT_SECRET=<32+ character random string>

# Admin
ADMIN_USERNAME=admin123
ADMIN_PASSWORD=admin@password123

# Image Upload
IMAGEKIT_PRIVATE_KEY=<key>
IMAGEKIT_PUBLIC_KEY=<key>
IMAGEKIT_URL_ENDPOINT=<url>

# Server
PORT=3000
NODE_ENV=development|production
CLIENT_URL=http://localhost:5173|https://yourdomain.com

# Email (SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<username>
SMTP_PASS=<password>
SMTP_FROM=<sender-email>
APP_NAME=ShopZen
```

---

## Common Issues & Solutions

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill the process using the port
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error

**Error:** `Could not connect to MongoDB`

**Solution:**
1. Check your MONGO_URI is correct
2. Verify MongoDB Atlas allows your IP:
   - Go to Security → Network Access
   - Add your IP address
3. Check username and password

### SMTP Not Working

**Error:** `SMTP is not configured`

**Solution:**
1. Verify all SMTP variables in .env
2. Check SMTP_HOST and SMTP_PORT
3. Verify credentials with email provider
4. Check if sender email is verified

### Emails Not Sending

**Debug Steps:**
1. Check backend logs for errors
2. Verify SMTP credentials
3. Check email provider's sending limits
4. Test with development mode (without SMTP)

---

## Deployment

### Backend Deployment (Heroku, Render, Railway)

**Prepare for Production:**
1. Set `NODE_ENV=production`
2. Update `CLIENT_URL` to production frontend URL
3. Add all environment variables

**Deploy Steps:**
1. Connect your Git repository
2. Set environment variables in platform
3. Deploy automatically on git push

### Frontend Deployment (Vercel, Netlify)

**Build:**
```bash
npm run build
# Creates 'dist' folder
```

**Deploy:**
1. Connect Git repository to Vercel/Netlify
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically

### MongoDB Atlas Deployment

Already in cloud - no additional setup needed!

---

## Support & Resources

- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **React:** https://react.dev/
- **Nodemailer:** https://nodemailer.com/

---

## Version History

- **v1.0.0** (June 2024)
  - Initial setup with all features
  - Email notifications for orders and password reset
  - Free SMTP configuration guide

---

**Need help?** Check the documentation files:
- `EMAIL_FEATURES.md` - Detailed email features
- `.env.example` - All available configuration options
- Backend `README.md` - Backend specific information

Happy coding! 🚀
