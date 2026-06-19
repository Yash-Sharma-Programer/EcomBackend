import express from 'express'
import authRouter from './routes/auth.route.js'
import cartRouter from './routes/cart.route.js'
import orderRouter from './routes/order.route.js'
import reviewRouter from './routes/review.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: "https://inter-ecom-front-d2y7.vercel.app",
    credentials: true
}));

app.use('/', authRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)
app.use('/reviews', reviewRouter)

app.get('/', (req, res) => {
     res.status(200).json({
        message: "Backend Runs Succesfully"
     })
})

export default app
