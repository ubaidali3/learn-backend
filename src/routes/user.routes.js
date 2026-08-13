import {Router} from 'express'
import { loginUser, logOutUser, refreshAccessToken, registerUser } from '../controllers/user.controllers.js'
import {upload} from '../middlewares/mullter.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const routes=Router()

routes.route('/register').post(
  upload.fields([
      {name:"avatar",
        maxCount:1

      },
      
  ]),
  registerUser)
  routes.route('/login').post(loginUser)


  ///sercure route

  routes.route('/logout').post(verifyJWT, logOutUser)
  routes.route('/refresh-token').post(refreshAccessToken)

export default routes