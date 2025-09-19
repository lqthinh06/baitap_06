import { Router } from "express";
import { auth } from "../middleware/auth";
import { getSimilarProducts, addViewAndTrack, getRecentlyViewed, getProductStats } from "../controllers/product.extra.controller";

const r = Router();
r.get("/:id/similar", getSimilarProducts);
r.get("/:id/stats", getProductStats);
r.post("/:id/view", auth, addViewAndTrack);    // ghi nhận đã xem (có auth mới lưu RV server)
r.get("/me/recently-viewed", auth, getRecentlyViewed);

export default r;
