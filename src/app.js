import express from 'express'
import authRouter from '../src/routes/auth.route.js'
import cartRouter from '../src/routes/cart.route.js'
import orderRouter from '../src/routes/order.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: "https://inter-ecom-front-d2y7.vercel.app/",
    credentials: true
}));

app.use('/', authRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

export default app
