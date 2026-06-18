# Complete E-Commerce Platform - Full Stack Application

A fully responsive, feature-rich e-commerce platform built with MERN stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS.

## 🌟 Features

### Admin Panel Features
- **Dashboard**: View total users, products, orders, categories, and revenue
- **Product Management**: Add, edit, delete products with multiple images
- **Category Management**: Add, edit, delete categories with descriptions
- **Order Management**: View all orders, update status, filter and search
- **User Management**: View users, block/unblock, delete accounts
- **Review Management**: Approve/reject customer reviews
- **CMS**: Manage pages, menus, and site settings
- **Settings**: Configure website information, logo, favicon, social media links

### User Website Features
- **Homepage**: Hero banner, featured products, categories section
- **Product Catalog**: Browse products by category, filter by price/rating
- **Product Details**: Multiple images, reviews, related products
- **Shopping Cart**: Add items, update quantities, remove items
- **Checkout**: Shipping address, payment method selection
- **User Account**: Profile management, order history, saved addresses
- **Wishlist**: Save favorite products
- **Reviews**: Submit ratings and reviews after purchase
- **Responsive Design**: Mobile, tablet, and desktop optimized

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Lucide Icons
- Zustand (State Management)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (File Upload)
- Bcrypt (Password Hashing)

## 📦 Project Structure

```
ecommerce-project/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/     # Reusable components
│       │   ├── Header.js
│       │   └── Footer.js
│       ├── pages/          # Page components
│       │   ├── Home.js
│       │   ├── Products.js
│       │   ├── Cart.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Profile.js
│       │   └── admin/      # Admin pages
│       │       ├── Dashboard.js
│       │       ├── Products.js
│       │       ├── Categories.js
│       │       ├── Orders.js
│       │       ├── Users.js
│       │       └── Settings.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── models/                 # MongoDB schemas
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Review.js
│   ├── Page.js
│   ├── Menu.js
│   └── Settings.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── orders.js
│   ├── users.js
│   ├── reviews.js
│   ├── pages.js
│   ├── menus.js
│   └── settings.js
├── server.js              # Express server entry point
├── package.json
├── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone or extract the project**
```bash
cd ecommerce-project
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Configure environment variables**
Create a `.env` file in the root directory:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
```

### Running the Application

**Development Mode:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

**Production Build:**
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (Admin)
- `GET /api/orders/:id` - Get order details

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user details (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Approve/reject review (Admin)
- `DELETE /api/reviews/:id` - Delete review (Admin)

### Pages (CMS)
- `GET /api/pages` - Get all pages
- `POST /api/pages` - Create page (Admin)
- `PUT /api/pages/:id` - Update page (Admin)
- `DELETE /api/pages/:id` - Delete page (Admin)

### Menus (CMS)
- `GET /api/menus` - Get menus
- `POST /api/menus` - Create menu (Admin)
- `PUT /api/menus/:id` - Update menu (Admin)
- `DELETE /api/menus/:id` - Delete menu (Admin)

### Settings
- `GET /api/settings` - Get site settings
- `PUT /api/settings` - Update settings (Admin)

## 🎨 Responsive Design Features

- **Mobile-First Approach**: Optimized for all screen sizes
- **Tailwind CSS**: Utility-first CSS framework
- **Flexible Grid System**: Responsive grid layouts
- **Touch-Friendly**: Mobile-optimized buttons and navigation
- **Hamburger Menu**: Mobile navigation menu
- **Responsive Images**: Optimized image loading
- **Adaptive Typography**: Font sizes adjust to screen size

## 🔐 Security Features

- JWT Token Authentication
- Password Hashing with Bcrypt
- CORS Protection
- Input Validation
- Secure API Routes

## 📱 Screen Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Customer support chat
- [ ] Product recommendations
- [ ] Wishlist sharing
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced search filters

## 📝 Database Models

### User
- Profile information
- Addresses
- Wishlist
- Order history

### Product
- Images (multiple)
- Category relationship
- Reviews
- Stock management

### Order
- Order items
- Shipping address
- Payment status
- Order timeline

### Review
- Rating (1-5 stars)
- Comment
- Approval status
- User reference

### Page (CMS)
- Title and slug
- Content
- SEO meta data
- Published status

## 🤝 Contributing

This is a complete starter template. Feel free to extend with:
- Additional features
- Payment integration
- Email notifications
- Advanced analytics

## 📄 License

This project is open source and available for personal and commercial use.

## 🆘 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Happy Coding! 🚀**

Build your e-commerce empire with this complete platform.
