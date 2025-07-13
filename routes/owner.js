const express = require("express");
const Form = require("../models/Userschema");
const validator = require("validator");
const bcrypt=require("bcryptjs");
const router=express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware=require('../middleware/ownerMiddle');
const secretkey = process.env.JWT_SECRET;
require('dotenv').config();



router.post('/signup', async (req, res) => {
    const { name, email, phone,role, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !role || !password || !confirmPassword) {
    return res.status(400).send("All fields are required");
    }

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }

    if (!validator.isEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

    const existingUser = await Form.findOne({ email });
    if (existingUser) {
        return res.status(400).send("User already registered");
    }
    
    const salt=await bcrypt.genSalt(4);
    const hashPassword=await bcrypt.hash(password,salt);
    
const lowerEmail=email.toLowerCase();

    try {
        const newUser = new Form({ name, email:lowerEmail, phone,role ,password: hashPassword });
        await newUser.save();
        res.status(201).send("Signup successful");
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).send("Server error during signup");
    }
});




router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Form.findOne({ email });
        if (!user) {
            return res.status(400).send("User does not exist");
        }

        const match=await bcrypt.compare(password,user.password);
        if(!match){
            return res.send("password isn not matched");
        }

         if (!validator.isEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

        
        const token = jwt.sign({ id: user._id }, secretkey, { expiresIn: '2d' });
        res.status(200).json({
            message: "Signin successful",
            token: token,
            user: {
                name: user.name,
                role: user.role
            }
        }); 
    } 
    catch (err) {
        console.error("Signin error:", err);
        res.status(500).send("Server error during signin");
    }
});



router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});


router.put('/update-profile', authMiddleware, async (req, res) => {
  const { name, phone } = req.body;

  try {
    const user = await Form.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name)
         {user.name = name};
    if (phone)
         {user.phone = phone};

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;