import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const OrderSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  billingAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  trackingId: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'orders' // Specify the collection name explicitly
});

export default model('Order', OrderSchema);
