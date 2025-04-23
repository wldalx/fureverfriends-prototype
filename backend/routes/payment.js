import express from 'express'
import * as PaymentController from "../controllers/PaymentController.js"
import { authenticate } from '../middleware/auth.js'

const paymentRouter = express.Router()
paymentRouter.post('/', authenticate, PaymentController.paymentIntent)

export default paymentRouter