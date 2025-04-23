import express from 'express'
import * as BookingController from '../controllers/BookingController.js'
import { authenticate } from '../middleware/auth.js'

const bookingRouter = express.Router()
bookingRouter.get('/', authenticate, BookingController.get)
bookingRouter.get('/:id', authenticate, BookingController.getById)
bookingRouter.post('/', authenticate, BookingController.post)
bookingRouter.delete('/:id', authenticate, BookingController.deleteById)
bookingRouter.put('/:id', authenticate, BookingController.putById)

export default bookingRouter