import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  isVerified: boolean;

  // OTP đăng ký
  registerOtpHash?: string | null;
  registerOtpExpires?: Date | null;
  registerOtpAttempts?: number;

  // OTP quên mật khẩu
  resetOtpHash?: string | null;
  resetOtpExpires?: Date | null;
  resetOtpAttempts?: number;

  comparePassword(candidate: string): Promise<boolean>;
  setPassword(newPass: string): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:  { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  isVerified: { type: Boolean, default: false },

  registerOtpHash: { type: String, default: null },
  registerOtpExpires: { type: Date, default: null },
  registerOtpAttempts: { type: Number, default: 0 },

  resetOtpHash: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },
  resetOtpAttempts: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  // @ts-ignore
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  // @ts-ignore
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.setPassword = async function (newPass: string) {
  this.password = newPass;
};

export default mongoose.model<IUser>('User', UserSchema);
