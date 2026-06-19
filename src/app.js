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
    origin: "http://localhost:5173",
    credentials: true
}));

app.use('/', authRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)
app.use('/reviews', reviewRouter)

export default app
