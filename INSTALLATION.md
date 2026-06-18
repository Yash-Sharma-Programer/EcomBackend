# Installation & Configuration Guide

## System Requirements

- Node.js v14+ 
- MongoDB v4.4+
- npm v6+ or yarn
- 500MB free disk space

## Installation Steps

### 1. Extract Project
```bash
unzip ecommerce-fullstack.zip
cd ecommerce-project
```

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Mac (using Homebrew)
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows
# Start MongoDB from Services or run mongod.exe
```

#### Option B: MongoDB Atlas (Cloud)
1. Visit: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

### 4. Environment Configuration

Create/Update `.env` file:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Image Upload (Optional)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 5. Start Application

**Development Mode:**

Terminal 1 (Backend):
```bash
npm run dev
```
Expected output:
```
Server running on port 5000
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```
Expected output:
```
Webpack compiled successfully
```

### 6. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin: http://localhost:3000/admin/dashboard

## Database Initialization

### Create Test Data (Optional)

Run this in MongoDB shell:
```javascript
// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // bcrypted password
  role: "admin",
  createdAt: new Date()
});

// Create sample category
db.categories.insertOne({
  name: "Electronics",
  slug: "electronics",
  isActive: true,
  createdAt: new Date()
});

// Create sample product
db.products.insertOne({
  name: "Sample Product",
  description: "This is a sample product",
  price: 99.99,
  stock: 50,
  category: ObjectId("..."),
  status: "active",
  createdAt: new Date()
});
```

## Frontend Build

### Development Build
```bash
cd client
npm start
```

### Production Build
```bash
cd client
npm run build
```

Output: `client/build/`

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:**
```bash
# Check if MongoDB is running
mongosh  # or mongo

# If not running, start it
# Mac: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
```

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Kill process on port 3000
# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Port 5000 Already in Use
**Solution:**
```bash
# Change PORT in .env to 5001
# And update frontend API URL
```

### Issue: Module Not Found
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Same for client
cd client
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS Errors
**Solution:**
Check `server.js` CORS configuration:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## Performance Optimization

### Backend Optimization
- Use indexes in MongoDB
- Implement caching with Redis
- Use compression middleware
- Optimize API responses

### Frontend Optimization
- Code splitting
- Lazy loading components
- Image optimization
- Minify CSS/JS in production

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable HTTPS in production
- [ ] Add rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Use environment variables for secrets
- [ ] Update dependencies regularly
- [ ] Enable CORS properly

## Testing

### Manual Testing Checklist
- [ ] User registration
- [ ] User login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Admin login
- [ ] Add/edit products
- [ ] Manage orders
- [ ] Responsive design on mobile

### API Testing with Postman
1. Install Postman
2. Create new collection
3. Add requests for each endpoint
4. Set environment variables
5. Test all CRUD operations

## Deployment Ready

### Pre-Deployment Checklist
- [ ] Update .env with production values
- [ ] Build frontend: `npm run build`
- [ ] Test in production mode
- [ ] Update database to production
- [ ] Configure SSL/HTTPS
- [ ] Set up email service
- [ ] Configure payment gateway
- [ ] Set up monitoring
- [ ] Create backups

### Deployment Platforms

**Backend Options:**
- Heroku
- AWS (EC2, Elastic Beanstalk)
- DigitalOcean
- Railway
- Render

**Frontend Options:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Cloudflare Pages

**Database Options:**
- MongoDB Atlas
- AWS DocumentDB
- Digital Ocean Managed MongoDB

## Maintenance

### Regular Tasks
- Update dependencies: `npm update`
- Monitor server logs
- Backup database daily
- Review security logs
- Optimize database indexes
- Clean up old data

### Monitoring
- Set up error tracking (Sentry)
- Use APM tools (New Relic)
- Monitor database performance
- Track API response times
- Set up alerts

## Support Resources

- Node.js: https://nodejs.org
- MongoDB: https://docs.mongodb.com
- Express: https://expressjs.com
- React: https://react.dev
- Tailwind: https://tailwindcss.com

---

**Installation Complete!** 🎉

Your e-commerce platform is ready to use!
