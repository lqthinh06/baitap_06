import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { api, getErrMsg } from "@/lib/api";

interface OTPVerificationFormProps {
  title: string;
  subtitle: string;
  email: string;
  mode?: "register" | "reset"; // mặc định register
  onVerifySuccess: () => void;
  onGoBack: () => void;
}

const OTPVerificationForm = ({
  title,
  subtitle,
  email,
  mode = "register",
  onVerifySuccess,
  onGoBack
}: OTPVerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ 6 số OTP", variant: "destructive" });
      return;
    }
    if (mode === "reset") {
      if (!newPassword || newPassword.length < 6) {
        toast({ title: "Lỗi", description: "Mật khẩu mới tối thiểu 6 ký tự", variant: "destructive" });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast({ title: "Lỗi", description: "Xác nhận mật khẩu không khớp", variant: "destructive" });
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === "register") {
        const { data } = await api.post("/auth/register/verify-otp", { email, otp });
        if (data?.token) localStorage.setItem("token", data.token);
        toast({ title: "Xác thực thành công!", description: "Tài khoản đã được kích hoạt" });
      } else {
        const { data } = await api.post("/auth/reset-password-otp", { email, otp, newPassword });
        if (data?.token) localStorage.setItem("token", data.token);
        toast({ title: "Đặt lại mật khẩu thành công!", description: "Bạn có thể đăng nhập ngay" });
      }
      onVerifySuccess();
    } catch (e) {
      toast({ title: "Xác thực thất bại", description: getErrMsg(e), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp("");
    setTimeLeft(60);
    try {
      if (mode === "register") {
        const { data } = await api.post("/auth/register/resend-otp", { email });
        toast({
          title: "Đã gửi lại OTP",
          description: "Vui lòng kiểm tra email" + (data?.devOtp ? ` (DEV OTP: ${data.devOtp})` : "")
        });
      } else {
        const { data } = await api.post("/auth/forgot-password", { email });
        toast({
          title: "Đã gửi lại OTP",
          description: "Vui lòng kiểm tra email" + (data?.devOtp ? ` (DEV OTP: ${data.devOtp})` : "")
        });
      }
    } catch (e) {
      toast({ title: "Không thể gửi lại OTP", description: getErrMsg(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">
          {subtitle}<br/>
          <span className="text-primary font-medium">{email}</span>
        </p>
        <p className="text-muted-foreground text-xs">Mã OTP sẽ hết hạn sau 10 phút</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground text-center block">Nhập mã OTP gồm 6 số</Label>
          <div className="flex justify-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {mode === "reset" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-foreground">Mật khẩu mới</Label>
              <Input type="password" placeholder="Nhập mật khẩu mới" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Xác nhận mật khẩu mới</Label>
              <Input type="password" placeholder="Nhập lại mật khẩu mới" value={confirmNewPassword} onChange={(e)=>setConfirmNewPassword(e.target.value)} />
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {timeLeft > 0 ? `Gửi lại OTP sau ${timeLeft}s` : "Bạn có thể gửi lại OTP"}
        </p>
      </div>

      <div className="space-y-3">
        <Button variant="auth" size="lg" className="w-full" onClick={handleVerifyOTP} disabled={isLoading || otp.length !== 6}>
          {isLoading ? "Đang xác thực..." : (mode === "register" ? "Xác thực OTP" : "Xác thực & Đổi mật khẩu")}
        </Button>

        <div className="text-center space-y-2">
          <Button variant="link" size="sm" onClick={handleResendOTP} disabled={timeLeft > 0} className="text-primary hover:text-primary-glow">
            Gửi lại OTP
          </Button>
        </div>

        <Button variant="auth-outline" size="lg" className="w-full" onClick={onGoBack}>
          ← Quay lại
        </Button>
      </div>
    </div>
  );
};

export default OTPVerificationForm;
