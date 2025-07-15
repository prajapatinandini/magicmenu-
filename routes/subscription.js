const express = require("express");
const crypto = require("crypto");
const { createRazorpayInstance } = require("../middleware/configRazorpay");
const router = express.Router();
const razorpayInstance = createRazorpayInstance();

// Mock Subscription Plans (Replace with DB if needed)
const subscriptions = [
    { id: "sub_basic", name: "Basic Plan", price: 199 },
    { id: "sub_standard", name: "Standard Plan", price: 499 },
    { id: "sub_premium", name: "Premium Plan", price: 999 },
];

// GET: Subscription Plans
router.get("/subscriptions", (req, res) => {
    res.json(subscriptions);
});

// POST: Create Razorpay Order
router.post("/create-order", async (req, res) => {
    const { subscriptionId } = req.body;
    const plan = subscriptions.find(sub => sub.id === subscriptionId);

    if (!plan) {
        return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const options = {
        amount: plan.price * 100, // Convert to paise
        currency: "INR",
    };

    try {
        razorpayInstance.orders.create(options, (err, order) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error creating order" });
            }
            res.json(order);
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// POST: Verify Razorpay Payment
router.post("/verify-payment", (req, res) => {
    const { order_Id, payment_Id, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${order_Id}|${payment_Id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
        res.json({ success: true, message: "Payment verified" });
    } else {
        res.status(400).json({ success: false, message: "Payment not verified" });
    }
});

module.exports = router;
