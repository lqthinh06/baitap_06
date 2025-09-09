import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  id: string
  name: string
  description?: string
  category: string
  brand?: string
  price: number
  discount?: number
  images: string[]
  stock: number
  sold: number
  rating: number
  ratingCount: number
  isBestSeller?: boolean
  isNew: boolean
  tags?: string[]
  views: number
  searchKeywords: string[]
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    brand: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isBestSeller: { type: Boolean, default: false },
    isNew: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    searchKeywords: { type: [String], default: [] },
  },
  { timestamps: true }
)

// Text search index for fuzzy search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  category: 'text',
  tags: 'text',
  searchKeywords: 'text'
}, {
  weights: {
    name: 10,
    brand: 8,
    category: 6,
    tags: 4,
    description: 2,
    searchKeywords: 5
  }
})

// Compound indexes for filtering
productSchema.index({ category: 1, price: 1 })
productSchema.index({ discount: -1, updatedAt: -1 })
productSchema.index({ rating: -1, ratingCount: -1 })
productSchema.index({ views: -1 })
productSchema.index({ sold: -1 })
productSchema.index({ isBestSeller: 1, isNew: 1 })

export default mongoose.model<IProduct>('Product', productSchema)
