import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', authenticate, authorize(['admin']), register);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
