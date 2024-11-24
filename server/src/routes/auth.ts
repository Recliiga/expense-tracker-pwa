import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req: any, res) => {
  res.json(req.user);
});

export default router;
