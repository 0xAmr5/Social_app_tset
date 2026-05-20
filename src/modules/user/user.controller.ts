import { Router } from 'express'
import { authentication, authorization } from '../../common/middleware/auth.middleware'
import { Validation } from '../../common/middleware/validation'
import { RoleEnum } from '../../common/enum/user.enum'
import userService from './user.service'
import { emptySchema, getUsersSchema, updateProfileSchema, userIdSchema } from './user.validation'

const router = Router()

router.get('/', authentication, Validation(getUsersSchema), userService.getUsers)
router.get('/profile', authentication, Validation(emptySchema), userService.profile)
router.patch('/profile', authentication, Validation(updateProfileSchema), userService.updateProfile)
router.delete('/profile', authentication, Validation(emptySchema), userService.deleteProfile)
router.get('/admin-only', authentication, authorization([RoleEnum.Admin]), Validation(emptySchema), userService.adminOnly)
router.get('/:id', authentication, Validation(userIdSchema), userService.getUserById)

export default router
