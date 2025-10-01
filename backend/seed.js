const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');
const User = require('./models/User');
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/foodorderingapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const items = [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.",
      "price": 3.56,
      "image": "margherita-pizza.jpg"
    }
  ];

const users = [
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    phone: 9876543210,
    password: '123456'
  }
];

const orders = [
  {
    id: 1001,
    userId: '66f22b5a4d1e2f3a4b5c6d7e',
    items: [
      {
        id: 1,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.',
        price: 8.99,
        image: 'margherita-pizza.jpg',
        quantity: 2
      }
    ],
    total: 17.98,
    orderDate: '2025-09-24T10:30:00.000Z',
    status: 'Paid',
    address: 'New Delhi'
  }
];

async function seedDatabase() {
  try {
    await FoodItem.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    
    await FoodItem.insertMany(items);
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    
    await Order.insertMany(orders);
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seedDatabase();