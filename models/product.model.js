import mongoose from "mongoose";
const { Schema } = mongoose;

const VariationSchema = new Schema({
  color: { type: String },
  size: { type: String },
  price: { type: Number, required: true }  // Each variation must have a price
});

const ProductSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  subcategory: { type: String, required: true },
  brand: { type: String, required: true },
  images: { type: [String], required: true },
  stock: { type: Number, required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  variations: [VariationSchema],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'products'
});

export default mongoose.model('Product', ProductSchema);
