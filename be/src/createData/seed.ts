import 'dotenv/config';
import Product from "../models/Product";
import { connectDB } from "../config/db";
import { indexProduct } from "../search/indexer";

async function seed() {
  try {
    await connectDB();

    const sampleProducts = Array.from({ length: 10 }).map((_, i) => {
      const basePrice = Math.floor(Math.random() * 2_000_000) + 100_000;
      const discount =
        Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : undefined;
      const originalPrice = discount
        ? basePrice + (basePrice * discount) / 100
        : undefined;

      return {
        name: `Hàng , sản phẩm ${i + 11}`,
        price: basePrice,
        originalPrice,
        image: `https://picsum.photos/300/300?random=${i + 1}`,
        rating: Number((Math.random() * 2 + 3).toFixed(1)),
        sold: Math.floor(Math.random() * 1000),
        discount,
        category: ["electronics", "fashion", "home"][Math.floor(Math.random() * 3)],
        views: Math.floor(Math.random() * 5000),
      };
    });

    // await Product.deleteMany({});
    const docs = await Product.insertMany(sampleProducts);

    // 👉 Index vào ES
    for (const doc of docs) {
      await indexProduct({
        id: doc.id.toString(),
        name: doc.name,
        price: doc.price,
        originalPrice: doc.originalPrice,
        image: doc.image,
        rating: doc.rating,
        sold: doc.sold,
        discount: doc.discount || 0,
        category: doc.category || 'other',
        views: doc.views || 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      });
    }

    console.log("🌱 Đã seed và index 15 sản phẩm mẫu");
  } catch (err) {
    console.error("❌ Lỗi khi seed:", err);
  } finally {
    process.exit();
  }
}

seed();
