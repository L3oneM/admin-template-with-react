const express = require('express');
const router = new express.Router();
const Product = require('../models/product');
const Order = require('../models/order');

router.post('/products', async (req, res) => {
  const product = new Product({
    ...req.body
  });

  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/products', async (req, res) => {
  try {
    const match = {};
    const sort = {};

    let limit = '';
    let skip = '';

    if (req.query.filter) {
      if (req.query.filter !== '{}') {
        const filters = req.query.filter.slice(1, -1).split(',');

        filters.map(filter => {
          const searchId = filter.split(':');
          match._id = searchId[1].slice(1, -1);
        });
      }
    }

    if (req.query.range) {
      if (req.query.range !== '[]') {
        const filter = req.query.range.slice(1, -1).split(',');

        limit = filter[1] - filter[0] + 1;
        skip = filter[0] === 0 ? 1 : filter[0];
      }
    }

    if (req.query.sort) {
      const parts = req.query.sort.split('"');
      sort[parts[1]] = parts[3] === 'DESC' ? -1 : 1;
    }

    const total = await Product.find({}).countDocuments({});

    const products = await Product.find(match)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort);

    res.send({ products, total });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/products/many', async (req, res) => {
  try {
    const sort = {};

    if (req.query.sort) {
      const parts = req.query.sort.split('"');
      sort[parts[1]] = parts[3] === 'DESC' ? -1 : 1;
    }

    const products = await Product.find({}).sort(sort);
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/products/:productId', async (req, res) => {
  const id = req.params.productId;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    res.send(product);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.productId
    });

    if (!product) {
      return res.status(404).send();
    }

    await Order.deleteMany({ product: req.params.productId });

    res.send(product);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/products/:productId', async (req, res) => {
  console.log('Update req.params.productId', req.params.productId);

  const id = req.params.productId;

  const allowedUpdates = [
    'description',
    'price',
    'quantity',
    'createdAt',
    'id',
    'pictures'
  ];

  const updates = Object.keys(req.body);

  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  const data = req.body.pictures[0].src;

  const newUpdates = updates.slice(0, -1);

  try {
    const product = await Product.findById(id);

    newUpdates.forEach(update => {
      product[update] = req.body[update];
    });

    product.pictures = data;

    await product.save();
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
