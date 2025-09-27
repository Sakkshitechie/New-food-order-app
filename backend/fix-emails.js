const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixEmails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodorderingapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Get all users
    const users = await User.find({});
    
    // Update each user to normalize email
    for (const user of users) {
      if (user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        if (user.email !== normalizedEmail) {
          await User.updateOne(
            { _id: user._id },
            { email: normalizedEmail }
          );
          console.log(`Updated email: ${user.email} -> ${normalizedEmail}`);
        }
      }
    }

    console.log('Email normalization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing emails:', error);
    process.exit(1);
  }
}

fixEmails();