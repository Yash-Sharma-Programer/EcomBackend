import express from 'express'
import authRouter from './src/routes/auth.route.js'
import productRouter from './src/routes/product.route.js'
import categoryRouter from './src/routes/category.route.js'
import orderRouter from './src/routes/order.route.js'
import userRouter from './src/routes/user.route.js'
import reviewRouter from './src/routes/review.route.js'
import dashboardRouter from './src/routes/dashboard.route.js'
import pageRouter from './src/routes/page.route.js'
import menuRouter from './src/routes/menu.route.js'
import siteSettingsRouter from './src/routes/siteSettings.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'
import config from './src/config/config.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin:  'https://inter-ecom-front-d2y7.vercel.app',
    credentials: true
}));

app.use('/', authRouter)
app.use('/products', productRouter)
app.use('/categories', categoryRouter)
app.use('/orders', orderRouter)
app.use('/users', userRouter)
app.use('/reviews', reviewRouter)
app.use('/admin/dashboard', dashboardRouter)
app.use('/pages', pageRouter)
app.use('/menus', menuRouter)
app.use('/site-settings', siteSettingsRouter)

// Centralized error handler (e.g. multer file-size/type errors)
app.use((err, req, res, next) => {
    if (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Something went wrong' })
    }
    next()
})

export default app
