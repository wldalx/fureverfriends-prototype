import express from 'express'
import * as AuthController from '../controllers/AuthController.js'

const authRouter = express.Router()
authRouter.post('/token', AuthController.token)
authRouter.delete('/token', AuthController.clearCookie)
authRouter.get('/status', AuthController.getStatus)

export default authRouter;