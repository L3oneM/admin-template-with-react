const express = require('express');
require('./db/mongoose');

const cors = require('cors');

const {
  requestLogger,
  unknownEndpoint,
  errorHandler
} = require('./middlewares/middelwares');

const userRouter = require('./routers/user');
const productRouter = require('./routers/products');
const orderRouter = require('./routers/orders');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: '2MB' }));
app.use(requestLogger);

app.use(userRouter);
app.use(productRouter);
app.use(orderRouter);

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});
