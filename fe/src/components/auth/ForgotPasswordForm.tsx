import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api, getErrMsg } from "@/lib/api";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSwitchToSignUp: () => void;
  onEmailSent: (email: string) => void;
}

const ForgotPasswordForm = ({ onSwitchToLogin, onSwitchToSignUp, onEmailSent }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast({
        title: "Email đã được gửi!",
        description: "Đã gửi mã OTP đến email của bạn" + (data?.devOtp ? ` (DEV OTP: ${data.devOtp})` : "")
      });
      onEmailSent(email); // chuyển sang màn OTP (mode reset)
    } catch (e) {
      toast({ title: "Không thể gửi email", description: getErrMsg(e), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <Input id="email" name="email" type="email" placeholder="example@gmail.com"
               value={email} onChange={(e)=>setEmail(e.target.value)} required
               className="bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur-sm" />
      </div>
      <Button type="submit" variant="auth" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang gửi..." : "Gửi hướng dẫn"}
      </Button>
      <div className="text-center">
        <Button type="button" variant="link" size="sm" onClick={onSwitchToLogin} className="text-primary hover:text-primary-glow">
          ← Quay về đăng nhập
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;