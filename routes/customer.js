const express = require("express");
const router = express.Router();
const Customer = require("../models/Customerschema");
const nodemailer = require("nodemailer");
require("dotenv").config(); 

const otpStore = new Map(); // In-memory OTP store

// 📤 Send OTP
router.post("/send-otp", async (req, res) => {
  const { phone, name, tableId, cafeId, email } = req.body;

  if (!phone || !name || !tableId || !cafeId || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();

  otpStore.set(normalizedEmail, {
    otp,
    expiresAt,
    name,
    phone,
    tableId,
    cafeId
  });

  console.log(`[OTP STORED] ${normalizedEmail} → ${otp} (expires at ${expiresAt})`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
       user: process.env.GMAIL_USER,
       pass: process.env.GMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: '"MagicMenu OTP" <nandiniprajapati422@gmail.com>',
    to: email,
    subject: "Your MagicMenu OTP",
    text: `Your OTP code is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message
    });
  }
});

// ✅ Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const normalizedEmail = email.toLowerCase();
  const stored = otpStore.get(normalizedEmail);

  console.log(`[OTP CHECK] For: ${normalizedEmail}`);
  console.log("Provided OTP:", otp);
  console.log("Stored Data:", stored);
  console.log("Current Time:", Date.now());

  if (!stored) {
    return res.status(400).json({ message: "No OTP sent or expired (server restart?)" });
  }

  if (stored.otp.toString() !== otp.toString()) {
    return res.status(400).json({ message: "Incorrect OTP" });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ message: "OTP expired" });
  }

  try {
    let customer = await Customer.findOne({ phone: stored.phone });

    if (!customer) {
      customer = new Customer({
        name: stored.name,
        phone: stored.phone,
        email: normalizedEmail,
        isGuest: true,
        table: stored.tableId,
        cafe: stored.cafeId
      });

      await customer.save();
    }

    otpStore.delete(normalizedEmail);
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ message: "Error verifying customer", error: err.message });
  }
});

module.exports = router;
