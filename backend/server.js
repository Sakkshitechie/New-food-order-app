const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodorderingapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
})
.catch(err => {
  process.exit(1);
});

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/items', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', require('./routes/cart'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
