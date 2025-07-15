const express = require("express");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("socket.io");


const PORT = process.env.PORT || 9000;
const MONGO_URI = "mongodb+srv://nandini:nandini21@cluster0.eogaihp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});


app.set("io", io);

mongoose.connect(MONGO_URI)


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));


const authRoutes = require("./routes/owner");
const cafeRoutes = require("./routes/cafe");
const menuRoutes = require("./routes/menu");
const tableRoutes = require("./routes/table");
const orderRoutes = require("./routes/order");
const customerRoutes = require("./routes/customer");
const subRoutes = require("./routes/subscription");

app.use("/api/auth", authRoutes);
app.use("/api/cafe", cafeRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/subcription",subRoutes);


io.on("connection", (socket) => {
  console.log(" New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log(" Client disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});










