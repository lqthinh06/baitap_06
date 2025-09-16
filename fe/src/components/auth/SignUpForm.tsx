import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api, getErrMsg } from "@/lib/api";

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSwitchToForgotPassword: () => void;
  onSignUpSuccess: (email: string) => void;
}

const SignUpForm = ({ onSwitchToLogin, onSwitchToForgotPassword, onSignUpSuccess }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { name: formData.fullName, email: formData.email, password: formData.password };
      const { data } = await api.post("/auth/register", payload);
      toast({
        title: "Đăng ký thành công!",
        description: "Vui lòng nhập OTP đã gửi tới email" + (data?.devOtp ? ` (DEV OTP: ${data.devOtp})` : "")
      });
      onSignUpSuccess(formData.email); // chuyển sang màn OTP
    } catch (e) {
      toast({ title: "Không thể đăng ký", description: getErrMsg(e), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground">Họ và tên</Label>
          <Input id="fullName" name="fullName" type="text" placeholder="Nhập họ và tên của bạn"
                 value={formData.fullName} onChange={handleInputChange} required
                 className="bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input id="email" name="email" type="email" placeholder="example@gmail.com"
                 value={formData.email} onChange={handleInputChange} required
                 className="bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Mật khẩu</Label>
          <Input id="password" name="password" type="password" placeholder="Nhập mật khẩu"
                 value={formData.password} onChange={handleInputChange} required
                 className="bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">Xác nhận mật khẩu</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu"
                 value={formData.confirmPassword} onChange={handleInputChange} required
                 className="bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur-sm" />
        </div>
      </div>

      <Button type="submit" variant="auth" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang xử lý..." : "Đăng ký"}
      </Button>

      <div className="text-center space-y-2">
        <Button type="button" variant="link" size="sm" onClick={onSwitchToForgotPassword} className="text-primary hover:text-primary-glow">
          Quên mật khẩu?
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
        </div>
      </div>

      <Button type="button" variant="auth-outline" size="lg" className="w-full" onClick={onSwitchToLogin}>
        Đã có tài khoản? Đăng nhập
      </Button>
    </form>
  );
};

export default SignUpForm;
