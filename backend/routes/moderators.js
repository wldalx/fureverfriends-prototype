import express from 'express'
import * as ModeratorController from '../controllers/ModeratorController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const moderatorRouter = express.Router()
moderatorRouter.get('/', authenticate, authorize({role:'Moderator'}), ModeratorController.get)
moderatorRouter.get('/:id', authenticate, authorize({role:'Moderator'}), ModeratorController.getById)
moderatorRouter.post('/', authenticate, authorize({role:'Moderator'}), ModeratorController.post)
moderatorRouter.delete('/:id', authenticate, authorize({role:'Moderator'}), ModeratorController.deleteById)
moderatorRouter.put('/:id', authenticate, authorize({role:'Moderator'}), ModeratorController.putById)

export default moderatorRouter