const express=require('express');
const app=express();
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/owner");
const cafeRoutes = require("./routes/cafe");
const menuRoutes = require("./routes/menu");
const tableRoutes = require("./routes/table");
const orderRoutes = require("./routes/order");
const customerRoutes = require("./routes/customer");
const PORT=9000;

const uri="mongodb+srv://nandini:nandini21@cluster0.eogaihp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/cafe", cafeRoutes);
app.use("/api/menu",menuRoutes);
app.use("/api/table",tableRoutes);
app.use("/api/order",orderRoutes);
app.use("/api/customer",customerRoutes);


//686f744449913bc8aae4bfec
app.listen(PORT,()=>{
    console.log(`server running at http://localhost:${PORT}`)
});