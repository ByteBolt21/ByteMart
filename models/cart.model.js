import mongoose from 'mongoose';

const { Schema } = mongoose;

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variation: {
    color: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true } // Added stock to manage stock updates
  },
  quantity: { type: Number, required: true, min: 1 }
});

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [CartItemSchema]
}, {
  timestamps: true,
  collection: 'carts'
});

export default mongoose.model('Cart', CartSchema);
