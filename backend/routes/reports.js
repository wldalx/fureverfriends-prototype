import express from 'express'
import * as ReportController from '../controllers/ReportController.js'
import { authenticate } from '../middleware/auth.js'

const reportRouter = express.Router()
reportRouter.get('/', authenticate, ReportController.get)
reportRouter.get('/:id', authenticate, ReportController.getById)
reportRouter.post('/', authenticate, ReportController.post)
reportRouter.delete('/:id', authenticate, ReportController.deleteById)
reportRouter.put('/:id', authenticate, ReportController.putById)

export default reportRouter