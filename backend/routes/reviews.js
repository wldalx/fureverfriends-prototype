import express from 'express'
import * as ReviewController from '../controllers/ReviewController.js'
import { authenticate } from '../middleware/auth.js'

const reviewRouter = express.Router()
reviewRouter.get('/', ReviewController.get)
reviewRouter.get('/:id', ReviewController.getById)
reviewRouter.post('/', authenticate, ReviewController.post)
reviewRouter.delete('/:id', authenticate, ReviewController.deleteById)
reviewRouter.put('/:id', authenticate, ReviewController.putById)

export default reviewRouter