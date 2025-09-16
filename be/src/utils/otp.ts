import crypto from 'crypto';

export const generateOtp = (digits = 6) => {
  const n = Math.pow(10, digits - 1);
  const code = (Math.floor(Math.random() * 9 * n) + n).toString(); // 6 chữ số
  return code;
};

export const hashOtp = (otp: string) =>
  crypto.createHash('sha256').update(otp).digest('hex');
