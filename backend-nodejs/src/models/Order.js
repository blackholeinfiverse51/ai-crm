import mongoose from 'mongoose';
import { ORDER_STATUS } from '../config/constants.js';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PLACED
  },
  tracking: {
    placedAt: {
      type: Date,
      default: Date.now
    },
    dispatchedAt: {
      type: Date
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date
    },
    confirmedByCustomer: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    trim: true
  },
  shippingAddress: {
    shopName: String,
    address: String,
    phone: String
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Index for efficient queries
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
