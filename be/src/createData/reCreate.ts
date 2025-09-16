import 'dotenv/config';
import { es } from "../search/es";
import { connectDB } from "../config/db";
import { ES_INDEX, ensureIndex, indexProduct } from "../search/indexer";
import Product from "../models/Product";

async function reindexAll() {

    await connectDB();
  // Xóa index cũ
  const exists = await es.indices.exists({ index: ES_INDEX });
  if (exists) {
    await es.indices.delete({ index: ES_INDEX });
    console.log("❌ Deleted old index:", ES_INDEX);
  }
  // Tạo lại index với mapping chuẩn
  await ensureIndex();
  console.log("✅ Created new index:", ES_INDEX);

  // Lấy tất cả product từ Mongo
  const products = await Product.find();
  
  console.log(`🔄 Reindexing ${products.length} products...`);

  // Index từng product
  for (const p of products) {
    await indexProduct({
      id: p.id.toString(),
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      rating: p.rating,
      sold: p.sold,
      discount: p.discount || 0,
      category: p.category || "other",
      views: p.views || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  }

  console.log("✅ Reindex done!");
}

reindexAll().then(() => process.exit(0));
