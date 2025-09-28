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
      "image": "assets/images/margherita-pizza.jpg"
    },
    {
      "id": 2,
      "name": "Biryani",
      "description": "Aromatic basmati rice cooked with spices, meat, and saffron.",
      "price": 2.34,
      "image": "assets/images/biryani.jpg"
    },
    {
      "id": 3,
      "name": "Burger",
      "description": "Juicy beef patty with lettuce, tomato, cheese, and special sauce.",
      "price": 1.11,
      "image": "assets/images/burger.jpg"
    },
    {
      "id": 4,
      "name": "Dosa",
      "description": "Crispy fermented crepe made from rice batter and black lentils.",
      "price": 2.48,
      "image": "assets/images/dosa.jpg"
    },
    {
      "id": 5,
      "name": "Paneer Tikka",
      "description": "Marinated paneer cubes grilled to perfection with spices.",
      "price": 3.10,
      "image": "assets/images/paneer-tikka.jpg"
    },
    {
      "id": 6,
      "name": "Chicken Curry",
      "description": "Spicy and flavorful chicken curry with rich spices and coconut milk.",
      "price": 3.40,
      "image": "assets/images/chicken-curry.jpg"
    },
    {
      "id": 7,
      "name": "Caesar Salad",
      "description": "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese.",
      "price": 1.13,
      "image": "assets/images/caesar-salad.jpg"
    },
    {
      "id": 8,
      "name": "Pasta Alfredo",
      "description": "Creamy fettuccine pasta with Alfredo sauce and grilled chicken.",
      "price": 1.49,
      "image": "assets/images/pasta-alfredo.jpg"
    },
    {
      "id": 9,
      "name": "Chocolate Ice Cream",
      "description": "Smooth and creamy chocolate ice cream with chocolate sauce.",
      "price": 0.12,
      "image": "assets/images/chocolate-ice-cream.jpg"
    },
    {
      "id": 10,
      "name": "Sushi Rolls",
      "description": "Fresh sushi rolls with salmon, avocado, and cucumber.",
      "price": 3.99,
      "image": "assets/images/sushi.jpg"
    },
    {
      "id": 11,
      "name": "Tacos",
      "description": "Spicy tacos with salsa, cheese, and lettuce.",
      "price": 1.49,
      "image": "assets/images/tacos.jpg"
    }
  ];

const users = [
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    phone: 9876543210,
    password: '123456'
  },
  {
    name: 'Jane Smith',
    email: 'jane@gmail.com',
    phone: 9876543211,
    password: '123456'
  },
  {
    name: 'Admin User',
    email: 'admin@gmail.com',
    phone: 9876543212,
    password: 'admin123'
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
        image: 'assets/images/margherita-pizza.jpg',
        quantity: 2
      }
    ],
    total: 17.98,
    orderDate: '2025-09-24T10:30:00.000Z',
    status: 'Paid',
    address: 'New Delhi'
  },
  {
    id: 1002,
    userId: '66f22b5a4d1e2f3a4b5c6d7f',
    items: [
      {
        id: 2,
        name: 'Biryani',
        description: 'Aromatic basmati rice cooked with spices, meat, and saffron.',
        price: 12.99,
        image: 'assets/images/biryani.jpg',
        quantity: 1
      },
      {
        id: 5,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese.',
        price: 7.99,
        image: 'assets/images/caesar-salad.jpg',
        quantity: 1
      }
    ],
    total: 20.98,
    orderDate: '2025-09-24T11:45:00.000Z',
    status: 'Delivered',
    address: 'Mumbai'
  },
  {
    id: 1003,
    userId: '66f22b5a4d1e2f3a4b5c6d80',
    items: [
      {
        id: 3,
        name: 'Burger',
        description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce.',
        price: 9.99,
        image: 'assets/images/burger.jpg',
        quantity: 1
      },
      {
        id: 6,
        name: 'Chocolate Ice Cream',
        description: 'Smooth and creamy vanilla ice cream topped with chocolate sauce.',
        price: 4.99,
        image: 'assets/images/vanilla-ice-cream.jpg',
        quantity: 2
      }
    ],
    total: 19.97,
    orderDate: '2025-09-24T12:15:00.000Z',
    status: 'Pending',
    address: 'Bangalore'
  },
  {
    id: 1004,
    userId: '66f22b5a4d1e2f3a4b5c6d81',
    items: [
      {
        id: 8,
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese cubes marinated in spices.',
        price: 10.99,
        image: 'assets/images/paneer-tikka.jpg',
        quantity: 1
      }
    ],
    total: 10.99,
    orderDate: '2025-09-24T13:20:00.000Z',
    status: 'Delivered',
    address: 'Chennai'
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