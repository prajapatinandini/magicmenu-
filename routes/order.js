const express = require("express");
const router = express.Router();
const Order = require("../models/orderschema"); // FIXED path

// GET /cafes/:cafeId/orders - Get all orders for a cafe
router.get("/cafes/:cafeId/orders", async (req, res) => {
  try {
    const cafeId = req.params.cafeId;
    const orders = await Order.find({ cafe: cafeId }).populate("customer");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});








module.exports = router;
