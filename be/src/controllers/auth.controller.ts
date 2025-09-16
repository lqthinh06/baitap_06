import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { generateOtp, hashOtp } from '../utils/otp';
import { sendMail } from '../utils/mailer';
import nodemailService from '../service/nodemail.service';
import { EmailTypeEnum } from '../enums/emailType.enum';
import { NotificationDto } from '../dto/request/notification.dto';

const registerSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  name: z.string().min(2, { message: "Tên tối thiểu 2 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu phải từ 6 ký tự" }),
});


const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải từ 6 ký tự" }),
});

const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

const forgotSchema = z.object({ email: z.string().email() });

const resetWithOtpSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  otp: z.string().length(6, { message: "OTP phải gồm 6 số" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải từ 6 ký tự" }),
});

const OTP_TTL_MS = 1000 * 60 * 10; // 10 phút
const OTP_MAX_ATTEMPTS = 5;

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      issues: parsed.error.flatten(),   // FE có thể đọc fieldErrors
    });
  }
  const data = parsed.data;
  const exists = await User.findOne({ email: data.email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ ...data, isVerified: false });

  // Tạo OTP đăng ký
  const otp = generateOtp(6);
  user.registerOtpHash = hashOtp(otp);
  user.registerOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.registerOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const html = `<p>Mã OTP đăng ký của bạn là: <b>${otp}</b> (hết hạn sau 10 phút)</p>`;
//   try {
//     await sendMail(user.email, 'Your registration OTP', html);
//   } catch (e) {
//     console.log(otp);
//     // Nếu gửi mail lỗi, vẫn trả devOtp trong môi trường dev
//   }
await nodemailService.sendMail({
      type: EmailTypeEnum.VERIFY_EMAIL,
      email: [user.email],
      token: otp
    } as NotificationDto)

  return res.status(201).json({
    message: 'Registered. Please verify OTP sent to email.',
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

export const resendRegisterOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotSchema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If email exists, OTP has been sent.' });

  const otp = generateOtp(6);
  user.registerOtpHash = hashOtp(otp);
  user.registerOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.registerOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const html = `<p>Mã OTP đăng ký của bạn là: <b>${otp}</b> (hết hạn sau 10 phút)</p>`;
//   try { await sendMail(email, 'Your registration OTP', html); } catch {}
    await nodemailService.sendMail({
      type: EmailTypeEnum.VERIFY_EMAIL,
      email: [email],
      token: otp
    } as NotificationDto)
  return res.json({
    message: 'If email exists, OTP has been sent.',
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

export const verifyRegisterOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = otpVerifySchema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or OTP' });
  if (user.isVerified) return res.json({ message: 'Already verified' });

  if (!user.registerOtpHash || !user.registerOtpExpires || user.registerOtpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if ((user.registerOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many attempts' });
  }

  user.registerOtpAttempts = (user.registerOtpAttempts || 0) + 1;
  const ok = user.registerOtpHash === hashOtp(otp);
  if (!ok) {
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: 'OTP incorrect' });
  }

  user.isVerified = true;
  user.registerOtpHash = null;
  user.registerOtpExpires = null;
  user.registerOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return res.json({ message: 'Verified', token, user: { id: user.id, email: user.email, name: user.name } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", issues: parsed.error.flatten() });
  }
  const data = parsed.data;
  const user = await User.findOne({ email: data.email });
  
  if (!user || !(await user.comparePassword(data.password))) {
    console.log("mật khẩu đăng nhập", data.password, "Mật khẩu trên db: ", user?.password)
    return res.status(401).json({ message: 'Invalid credentials'});
  }
  if (!user.isVerified) return res.status(403).json({ message: 'Please verify your account via OTP' });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Quên mật khẩu: gửi OTP
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotSchema.parse(req.body);
  const user = await User.findOne({ email });
  // Trả 200 để không lộ email
  if (!user) return res.json({ message: 'If that email exists, an OTP has been sent.' });

  const otp = generateOtp(6);
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.resetOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  const html = `<p>Mã OTP đặt lại mật khẩu: <b>${otp}</b> (hết hạn sau 10 phút)</p>`;
//   try { await sendMail(email, 'Your password reset OTP', html); } catch {}
    await nodemailService.sendMail({
      type: EmailTypeEnum.FORGOT_PASSWORD_OTP,
      email: [email],
      token: otp
    } as NotificationDto)
  return res.json({
    message: 'If that email exists, an OTP has been sent.',
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

// Đặt lại mật khẩu bằng OTP
export const resetPasswordWithOtp = asyncHandler(async (req: Request, res: Response) => {
   const parsed = resetWithOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", issues: parsed.error.flatten() });
  }
  const { email, otp, newPassword } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or OTP' });

  if (!user.resetOtpHash || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many attempts' });
  }

  user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
  const ok = user.resetOtpHash === hashOtp(otp);
  if (!ok) {
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: 'OTP incorrect' });
  }
  await user.setPassword(newPassword);
  user.resetOtpHash = null;
  user.resetOtpExpires = null;
  user.resetOtpAttempts = 0;
  await user.save();

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return res.json({ message: 'Password reset', token, user: { id: user.id, email: user.email, name: user.name } });
});
