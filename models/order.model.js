import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      variation: { 
        color: { type: String },
        size: { type: String },
        price: { type: Number, required: true }
      },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  billingAddress: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  trackingId: { type: String },
  createdAt: { type: Date, default: Date.now },
  payment: { 
    method: { type: String }, // Adjust type as per your needs, e.g., 'Stripe' or 'PayPal'
    transactionId: { type: String } // Store transaction ID here
  }
}, {
  timestamps: true,
  collection: 'orders'
});

export default model('Order', OrderSchema);
