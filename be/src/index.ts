import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import productRoutes from './routes/product.routes';
import searchRoutes from './routes/search.routes';

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running http://localhost:${PORT}`));
});
