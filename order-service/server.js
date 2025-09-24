// require("dotenv").config();
// const express = require("express");
// const app = express();
// const orderRoutes = require("./routes/orderRoutes");
// const PORT = process.env.PORT || 1236;
// const connectDB = require("./config/db");

// connectDB();
// const { consumeMessage } = require("./utils/rabbitMQ");

// app.use(express.json());

// app.use("/api/orders", orderRoutes);

// consumeMessage("orderQueue", async (msg) => {
//   console.log("📩 Received order message:", msg);
//   console.log(
//     `Sending notification to user ${msg.userId} for order ${msg.orderId}`
//   );
// });

// app.listen(PORT, () => {
//   console.log(`Order service is running on port ${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const PORT = process.env.PORT || 1236;
const connectDB = require("./config/db");
const startOrderConsumer = require("./orderConsumer");

connectDB();

app.use(express.json());
app.use("/api/orders", orderRoutes);

// Start the order consumer from server.js
startOrderConsumer();

app.listen(PORT, () => {
  console.log(`🚀 Order service is running on port ${PORT}`);
});
