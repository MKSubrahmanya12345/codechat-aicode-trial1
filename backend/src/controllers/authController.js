// ??$$$ Auth controller - register and login
const bcrypt = require('bcryptjs');
const Driver = require('../models/Driver');
const { generateToken } = require('../utils/jwt');

// @desc    Register new admin/driver account
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, driverLicenseNumber } = req.body;

    const existing = await Driver.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const driver = await Driver.create({
      firstName,
      lastName,
      email,
      phone,
      driverLicenseNumber,
      passwordHash,
    });

    const token = generateToken({ userId: driver._id, email: driver.email });
    res.status(201).json({ token, userId: driver._id, firstName: driver.firstName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login driver/admin
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, driver.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: driver._id, email: driver.email });
    res.json({ token, userId: driver._id, firstName: driver.firstName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
