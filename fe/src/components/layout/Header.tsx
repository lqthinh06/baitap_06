import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuth.stores";
import UserMenu from "@/components/auth/UserMenu";

const Header = () => {
  const navigate = useNavigate();
  const data = useAuthStore((s) => s.data);
  const isAuthed = Boolean(data?.accessToken);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate("/")}
            >
              ShopVN
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {isAuthed ? (
              <UserMenu />
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex pb-4 space-x-6">
          <Button variant="ghost" className="text-sm font-medium">
            Trang chủ
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Điện thoại
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Laptop
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Thời trang
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Gia dụng
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
