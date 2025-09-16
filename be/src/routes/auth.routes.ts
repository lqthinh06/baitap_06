import { Router } from 'express';
import {
  register, resendRegisterOtp, verifyRegisterOtp,
  login, forgotPassword, resetPasswordWithOtp
} from '../controllers/auth.controller';

const router = Router();

// Đăng ký + OTP
router.post('/register', register);
router.post('/register/resend-otp', resendRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtp);

// Đăng nhập
router.post('/login', login);

// Quên mật khẩu + OTP
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordWithOtp);

export default router;
