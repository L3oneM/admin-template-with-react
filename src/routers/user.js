const express = require('express');
const router = new express.Router();
const User = require('../models/user');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();

    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users', async (req, res) => {
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

    const total = await User.find({}).countDocuments({});

    const users = await User.find(match)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort);

    res.send({ users, total });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users/many', async (req, res) => {
  try {
    const sort = {};

    if (req.query.sort) {
      const parts = req.query.sort.split('"');
      sort[parts[1]] = parts[3] === 'DESC' ? -1 : 1;
    }

    const users = await User.find({}).sort(sort);

    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users/:userId', async (req, res) => {
  const id = req.params.userId;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

// const upload = multer({
//   limits: {
//     fileSize: 1000000
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error('Please upload a jpg, jpeg or png file!'));
//     }

//     cb(undefined, true);
//   }
// });

router.patch('/users/:userId', async (req, res) => {
  const id = req.params.userId;

  const allowedUpdates = [
    'email',
    'phone',
    'name',
    'password',
    'createdAt',
    'id'
  ];

  const updates = Object.keys(req.body);

  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const user = await User.findById(id);

    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.userId
    });

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete('/users', async (req, res) => {
  try {
    let ids;

    if (req.query.filter) {
      const idpart = req.query.filter.split(':');
      const idsSting = idpart[1].slice(2, -3);
      ids = idsSting.split('","');
      console.log('ids', ids);
    }

    const deletedCount = await User.deleteMany({
      _id: ids
    });

    if (!deletedCount) {
      return res.status(404).send({ error: 'Users not found!' });
    }

    res.send(ids);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
