# E-Commerce Platform - Setup Guide

## Quick Start Guide

### Step 1: Initial Setup
```bash
# Extract the project
unzip ecommerce-fullstack.zip
cd ecommerce-project

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Configure Database
1. Make sure MongoDB is running on your system
2. Default connection: `mongodb://localhost:27017/ecommerce`
3. Update `.env` if using different MongoDB URI

### Step 3: Run Development Server

**Terminal 1 - Backend:**
```bash
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
# App opens on http://localhost:3000
```

### Step 4: Access the Application
- **User Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/dashboard (Admin login required)
- **API**: http://localhost:5000/api

## Test Credentials

### Admin Account
- Email: admin@example.com
- Password: admin123

### User Account
- Email: user@example.com
- Password: user123

## First Steps

1. **Sign Up / Login**: Create a user account
2. **Browse Products**: Explore available products
3. **Add to Cart**: Test shopping cart functionality
4. **Admin Access**: Login as admin to access dashboard

## Configuration

### Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
```

### Frontend Configuration (client/.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Features to Test

### User Features
- ✅ Register/Login
- ✅ Browse products
- ✅ Add to cart
- ✅ Checkout
- ✅ View profile
- ✅ Save addresses
- ✅ Submit reviews

### Admin Features
- ✅ Dashboard overview
- ✅ Manage products
- ✅ Manage categories
- ✅ Manage orders
- ✅ Manage users
- ✅ Site settings
- ✅ CMS pages

## Responsive Design Testing

### Mobile View
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test on iPhone SE (375px), iPhone 12 (390px)

### Tablet View
- Test on iPad (768px)

### Desktop View
- Test on 1024px+ screens

## Performance Tips

1. **Image Optimization**
   - Use compressed images
   - Implement lazy loading
   - Use WebP format

2. **Caching**
   - Enable browser caching
   - Use Redis for session store

3. **Database**
   - Add indexes to frequently queried fields
   - Use pagination for large datasets

## Deployment

### Hosting Options
- **Backend**: Heroku, AWS, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas

### Before Deployment
1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Build frontend: `npm run build`
4. Set secure JWT_SECRET
5. Configure CORS for production domain

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Linux/Mac)
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings

### CORS Errors
- Check backend CORS configuration
- Update allowed origins
- Verify API URL in frontend

## Support & Resources

- Tailwind CSS: https://tailwindcss.com
- React Docs: https://react.dev
- Express.js: https://expressjs.com
- MongoDB: https://www.mongodb.com
- Lucide Icons: https://lucide.dev

## Next Steps

1. Customize branding (colors, logo, name)
2. Connect payment gateway
3. Set up email notifications
4. Add product images
5. Configure social media links
6. Deploy to production

---

Happy building! 🚀
