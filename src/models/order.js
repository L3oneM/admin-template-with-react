const mongoose = require('mongoose');
const Product = require('./product');

const orderSchema = new mongoose.Schema(
  {
    orderBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

orderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
