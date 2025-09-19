import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const navigate = useNavigate();

  const goBack = () => {
    // Nếu có lịch sử thì quay lại, nếu mở trực tiếp (không history) thì về fallback
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <Button variant="ghost" onClick={goBack} className="inline-flex items-center gap-2">
      <ChevronLeft className="h-4 w-4" />
      Trở lại
    </Button>
  );
}
