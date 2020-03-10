const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      require: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    pictures: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
  }
});

// productSchema.pre('findOneAndDelete', async function(next) {
//   console.log(' I RRRRRRRRUUUUUNNNNNNNN!');
//   const product = this;
//   console.log('product', product._conditions._id);

//   const del = await Order.deleteMany({ product: product._conditions._id });
//   next();
// });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
