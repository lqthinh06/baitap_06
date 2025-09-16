import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api, getErrMsg } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '@/stores/useAuth.stores';
interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

const LoginForm = ({ onSwitchToSignUp, onSwitchToForgotPassword, onLoginSuccess }: LoginFormProps) => {

  
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const data = useAuthStore((s) => s.data);

  useEffect(() => {
    if (data) {
      navigate("/home");
      return;
    }
  }, [data])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.token) localStorage.setItem("token", data.token);
      toast({ title: "Đăng nhập thành công!", description: "Chào mừng bạn quay trở lại" });
      onLoginSuccess();
      useAuthStore.getState().setData({
          accessToken: data.token,
          name: data.user.name,
          avatarUrl: 'https://images.pexels.com/videos/7126452/pexels-photo-7126452.jpeg?auto=compress&cs=tinysrgb&w=600&loading=lazy'
        });
      navigate("/home");
    } catch (e) {
      toast({ title: "Đăng nhập thất bại", description: getErrMsg(e), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* ...giữ nguyên phần UI như bạn đang có... */}
      {/* chỉ khác phần handleLogin ở trên */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input id="email" type="email" placeholder="Nhập email của bạn" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Mật khẩu</Label>
          <Input id="password" type="password" placeholder="Nhập mật khẩu của bạn" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-3">
        <Button type="submit" variant="auth" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
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

        <Button type="button" variant="auth-outline" size="lg" className="w-full" onClick={onSwitchToSignUp}>
          Tạo tài khoản mới
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
