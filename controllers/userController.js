const User = require('../models/user');

module.exports = {
  createUser: async (req, res) => {
    try {
      const { name, email } = req.body;
      if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
      const user = await User.create({ name, email });
      res.status(201).json({ userId: user.id });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};