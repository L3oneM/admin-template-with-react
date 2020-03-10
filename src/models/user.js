const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('./order');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      }
    },
    phone: {
      type: String,
      require: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
  }
});

userSchema.pre('findOneAndDelete', async function(next) {
  const user = this;

  await Order.deleteMany({ orderBy: user._conditions._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
