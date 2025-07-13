const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Cafe = require("../models/Cafeschema");
const authMiddleware = require("../middleware/ownerMiddle");
require('dotenv').config();
const secretkey = process.env.JWT_SECRET;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/cafes/:id", async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }
    res.status(200).json(cafe);
  } catch (err) {
    console.error("Get cafe error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/cafes", authMiddleware, upload.single("logo"), async (req, res) => {
  try {
    const { name, address } = req.body;
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const cafe = new Cafe({
      owner: req.user._id,
      name,
      address,
      logoUrl
    });

    await cafe.save();

    res.status(201).json({ message: "Cafe created successfully", cafe });
  } catch (err) {
    console.error("Create cafe error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/cafes", authMiddleware, async (req, res) => {
  try {
    const allCafes = await Cafe.find(); 
    res.status(200).json(allCafes);     
  } catch (err) {
    console.error("Error fetching cafes:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/cafes/:id", authMiddleware, async (req, res) => {
  try {
    const cafesid = await Cafe.findOne(req.params.id); 
    res.status(200).json(cafesid);     
  } catch (err) {
    console.error("Error fetching cafes:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.put('/cafes/:id', upload.single('logo'), async (req, res) => {
  try {
    const { name, address } = req.body;
    const logo = req.file ? req.file.filename : undefined;

    const update = {};
    if (name) update.name = name;
    if (address) update.address = address;
    if (logo) update.logo = logo;

    const updatedCafe = await Cafe.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!updatedCafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    res.json({ message: 'Cafe updated', cafe: updatedCafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/cafes/:id', async (req, res) => {
  try {
    const deletedCafe = await Cafe.findByIdAndDelete(req.params.id);

    if (!deletedCafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    res.json({ message: 'Cafe deleted successfully', cafe: deletedCafe });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error while deleting cafe' });
  }
});



module.exports = router;
