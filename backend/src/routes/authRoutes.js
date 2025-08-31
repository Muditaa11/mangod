import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateAuthToken = (userId) => {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

router.post('/register', async(req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    //check if user exists in db
    const existingUser = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' }); 
    } 

    const profileImage = `https://ui-avatars.com/api/?name=${username}&background=random`;

    const user = new User({ email, username, password, profileImage});
    //hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const token = generateAuthToken(user._id); 
    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateAuthToken(user._id);
      res.json({ 
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          
        },
      }); 
    } catch (error) {
      console.error("Error in login route", error);
      res.status(500).json({ message: 'Server error' }); 
    }
});

export default router;