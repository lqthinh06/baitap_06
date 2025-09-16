import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import { ensureIndex } from './search/indexer';
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB();
  await ensureIndex(); // 👈 tạo index ES nếu chưa có
  app.listen(PORT, () => console.log(`API running http://localhost:${PORT}`));
})();