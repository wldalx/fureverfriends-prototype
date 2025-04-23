import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import { config } from 'dotenv'

import userRouter from './routes/users.js'
import bookingRouter from './routes/bookings.js'
import offerRouter from './routes/offers.js'
import reviewRouter from './routes/reviews.js'
import reportRouter from './routes/reports.js'
import moderatorRouter from './routes/moderators.js'
import authRouter from './routes/authentication.js'
import paymentRouter from './routes/payment.js'

config({ path: './.env' })

const app = express()
app.use(helmet()) // CSRF, etc.
app.use(cookieParser())
app.use(bodyParser.json({ limit: '2mb' }))
app.use(bodyParser.urlencoded({ extended: false }))

// Use routes
app.use('/api/users', userRouter)
app.use('/api/offers', offerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/reports', reportRouter)
app.use('/api/moderators', moderatorRouter)
app.use('/api/auth', authRouter)
app.use('/api/payment', paymentRouter)

// Connect to DB and run server
mongoose.connect(process.env.MONGODB_URI).then(() => {
    app.listen(process.env.PORT, () => {
        console.log('Backend running on port', process.env.PORT)
    })
}).catch(error => console.error(error))