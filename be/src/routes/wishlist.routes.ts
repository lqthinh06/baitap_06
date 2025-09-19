import { Router } from "express";
import { auth } from "../middleware/auth";
import { toggleWishlist, getWishlist, checkWishlist } from "../controllers/wishlist.controller";

const r = Router();
r.use(auth);
r.get("/", getWishlist);
r.get("/check/:productId", checkWishlist);
r.post("/:productId", toggleWishlist); // toggle
export default r;
