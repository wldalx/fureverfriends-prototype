import express from 'express'
import * as OfferController from "../controllers/OfferController.js"
import { authenticate } from '../middleware/auth.js'

const offerRouter = express.Router()
offerRouter.get('/', OfferController.get)
offerRouter.get('/:id', OfferController.getById)
offerRouter.post('/', authenticate, OfferController.post)
offerRouter.delete('/:id', authenticate, OfferController.deleteById)
offerRouter.put('/:id', authenticate, OfferController.putById)

// availabilities
offerRouter.get('/:id/availabilities', OfferController.getFreeAvailabilities)
offerRouter.post('/:id/availabilities', authenticate, OfferController.postAvailability)
offerRouter.delete('/:id/availabilities/:id_availability', authenticate, OfferController.deleteAvailability)

export default offerRouter