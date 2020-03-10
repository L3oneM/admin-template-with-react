const express = require('express');
const router = new express.Router();
const Order = require('../models/order');
const Product = require('../models/product');

router.post('/orders', async (req, res) => {
  const order = new Order(req.body);

  try {
    const product = await Product.findById(req.body.product);

    order.total = req.body.quantity * product.price;

    console.log(product);
    await order.save();

    res.status(201).send({ order });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/orders', async (req, res) => {
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

          match[
            searchId[0].slice(1, -1) === 'name' ? 'orderBy' : 'product'
          ] = searchId[1].slice(1, -1);
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

      if (parts[1] === 'product.description' || parts[1] === 'orderBy.name') {
        const newpart = parts[1].split('.');
        sort[newpart[0]] = parts[3] === 'DESC' ? -1 : 1;
      } else {
        sort[parts[1]] = parts[3] === 'DESC' ? -1 : 1;
      }
    }

    const total = await Order.find({}).countDocuments({});

    const orders = await Order.find(match)
      .populate('orderBy', { name: 1 })
      .populate('product', { description: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort);

    res.send({ orders, total });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/orders/many', async (req, res) => {
  try {
    const sort = {};

    if (req.query.sort) {
      const parts = req.query.sort.split('"');

      if (parts[1] === 'product.description' || parts[1] === 'orderBy.name') {
        const newpart = parts[1].split('.');
        sort[newpart[0]] = parts[3] === 'DESC' ? -1 : 1;
      } else {
        sort[parts[1]] = parts[3] === 'DESC' ? -1 : 1;
      }
    }

    const orders = await Order.find({})
      .populate('orderBy', { name: 1 })
      .populate('product', { description: 1 })
      .sort(sort);

    res.send(orders);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/orders/:orderId', async (req, res) => {
  const id = req.params.orderId;

  try {
    const order = await Order.findById(id)
      .populate('orderBy', { name: 1 })
      .populate('product', { description: 1 });

    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }

    res.send(order);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/orders/:orderId', async (req, res) => {
  const id = req.params.orderId;

  console.log('orders', req.body);

  const allowedUpdates = [
    'orderBy',
    'product',
    'quantity',
    'completed',
    'description',
    'createdAt',
    'id',
    'total'
  ];

  const updates = Object.keys(req.body);

  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    console.log('Doent pass The test');
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const order = await Order.findById(id);

    updates.forEach(update => {
      if (update === 'orderBy') {
        order.orderBy = req.body.orderBy.id;
      } else if (update === 'product') {
        order.product = req.body.product.id;
      } else {
        order[update] = req.body[update];
      }
    });

    console.log('I am the order', order);

    await order.save();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);

    if (!order) {
      return res.status(404).send();
    }

    res.send(order);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
