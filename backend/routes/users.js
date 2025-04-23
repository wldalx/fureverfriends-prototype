import express from 'express'
import * as UserController from '../controllers/UserController.js'
import { authenticate } from '../middleware/auth.js'

const userRouter = express.Router()
userRouter.get('/', UserController.get)
userRouter.get('/:id', UserController.getById)
userRouter.post('/', UserController.post) // registration, thus public
userRouter.delete('/:id', authenticate, UserController.deleteById)
userRouter.put('/:id', authenticate, UserController.putById)

export default userRouter