const express = require('express');
const nodemailer = require('nodemailer');
const { hash, compare } = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');

const router = express.Router();
const otpStorage = {}; // Temporary in-memory storage

// ✅ Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Mail transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'johinthpathi@gmail.com',  // ✅ Replace with your Gmail
    pass: "mwzk vbaw naqy fror"    // ✅ Replace with your app password (not regular password)
  }
});

// ✅ Function to send OTP via email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: 'johinthpathi@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

// ✅ Send OTP Route
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.cookies;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    otpStorage[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // Store OTP for 10 mins

    await sendOTPEmail(email, otp); // ✅ Send OTP via email

    res.json({ token: await hash(otp, 10) }); // Send hashed OTP to client
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ✅ Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email } = req.cookies;
    const { token, otp } = req.body;

    if (!otpStorage[email] || otpStorage[email].expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    const isMatch = await compare(otp, token);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete otpStorage[email]; // Remove OTP after verification

    const user = await prisma.user.findUnique({ where: { email } });
    const authToken = await generateToken(user.id);

    res.cookie("token", authToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;
