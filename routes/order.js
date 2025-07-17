const express = require("express");
const router = express.Router();
const Order = require("../models/Orderschema");

router.post("/orders", async (req, res) => {
  const { cafe, table, customer, items } = req.body;

  if (!cafe || !table || !customer || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Missing required fields or invalid items array." });
  }

  try {
    let totalAmount = 0;

    
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    const newOrder = new Order({
      cafe,
      table,
      customer,
      items,
      totalAmount
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cafe")
      .populate("table")
      .populate("customer")
      .populate("items.menuItem");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/customers/:customerId/orders", async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.customerId })
      .populate("cafe")
      .populate("table")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching customer's orders:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/cafes/:cafeId/orders", async (req, res) => {
  try {
    const orders = await Order.find({ cafe: req.params.cafeId })
      .populate("table")
      .populate("customer")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
  }
});


router.put("/orders/:orderId/status", async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Order status is required.",
    });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    ).populate("table customer items.menuItem");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    req.app.get("io").emit("orderStatusUpdated", order);

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: err.message,
    });
  }
});



router.put("/orders/:orderId/payment-status", async (req, res) => {
  const { paymentStatus } = req.body;

  if (!paymentStatus) {
    return res.status(400).json({
      success: false,
      message: "Payment status is required.",
    });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentStatus },
      { new: true }
    ).populate("table customer items.menuItem");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    req.app.get("io").emit("paymentStatusUpdated", order);

    res.json({
      success: true,
      message: "Payment status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: err.message,
    });
  }
});



router.get("/orders/today/:cafeId", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      cafe: req.params.cafeId,
      createdAt: { $gte: startOfDay }
    })
      .populate("table")
      .populate("customer")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch today's orders", error: err.message });
  }
});


module.exports = router;
