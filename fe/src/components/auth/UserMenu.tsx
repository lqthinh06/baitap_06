import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  User as UserIcon,
  Heart,
  Package,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuth.stores";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function UserMenu() {
  const navigate = useNavigate();
  const data = useAuthStore((s) => s.data);
  const setData = useAuthStore((s) => s.setData);

  const initials =
    (data?.name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token"); // nếu có lưu token riêng
    setData(null);
    toast({ title: "Đã đăng xuất" });
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-full p-1 hover:bg-muted transition"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={data?.avatarUrl} alt={data?.name || "User"} />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      {/* Layout mới: có header gradient + nội dung chia nhóm */}
      <DropdownMenuContent
        align="end"
        className="w-72 p-0 overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/40">
              <AvatarImage src={data?.avatarUrl} alt={data?.name || "User"} />
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold truncate">
                {data?.name || "Người dùng"}
              </div>
              <div className="text-xs/5 text-white/80">Thành viên</div>
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div className="p-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Tài khoản
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => navigate("/account")}
            >
              <UserIcon className="h-4 w-4" />
              Hồ sơ cá nhân
              <DropdownMenuShortcut>↵</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => navigate("/orders")}
            >
              <Package className="h-4 w-4" />
              Đơn hàng
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-4 w-4" />
              Yêu thích
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Hệ thống
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => navigate("/help")}
            >
              <HelpCircle className="h-4 w-4" />
              Trợ giúp
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
