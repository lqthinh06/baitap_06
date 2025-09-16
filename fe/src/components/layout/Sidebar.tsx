import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="space-y-6">
      {/* Price Filter */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Khoảng giá</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[0]}
            max={5000000}
            step={100000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0đ</span>
            <span>5.000.000đ</span>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Danh mục</h3>
        <div className="space-y-3">
          {[
            "Điện thoại & Phụ kiện",
            "Máy tính & Laptop", 
            "Thời trang nam",
            "Thời trang nữ",
            "Gia dụng",
            "Sách & Văn phòng phẩm"
          ].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category} />
              <label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Rating Filter */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Đánh giá</h3>
        <div className="space-y-3">
          {[5, 4, 3].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox id={`rating-${rating}`} />
              <label htmlFor={`rating-${rating}`} className="flex items-center space-x-1 text-sm cursor-pointer">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating ? "fill-rating text-rating" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span>trở lên</span>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Location */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Địa điểm</h3>
        <div className="space-y-3">
          {[
            "Hồ Chí Minh",
            "Hà Nội",
            "Đà Nẵng",
            "Cần Thơ",
            "Hải Phòng"
          ].map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox id={location} />
              <label htmlFor={location} className="text-sm cursor-pointer">
                {location}
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Button className="w-full bg-gradient-primary hover:opacity-90">
        Áp dụng bộ lọc
      </Button>
    </div>
  );
};

export default Sidebar;