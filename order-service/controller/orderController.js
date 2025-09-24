const Order = require("../model/Order");
const axios = require("axios");
const { publishMessage } = require("../utils/rabbitMQ");
const publishOrder = require("../orderPublisher");

// order controller
// const placeOrder = async (req, res) => {
//   const userId = req.user.id; // Use the user ID from the authenticated request
//   const { products } = req.body;
//   try {
//     let totalAmount = 0;
//     const orderProducts = [];
//     for (let i = 0; i < products.length; i++) {
//       const response = await axios.get(
//         `http://product-service:1235/api/products/getProduct/${products[i].productId}`
//       );
//       const product = response.data;
//       if (!product) {
//         return res.status(404).json({ message: "Order not found" });
//       }
//       if (product.stock < products[i].quantity) {
//         return res
//           .status(400)
//           .json({ message: `Insufficient stock for product ${product.name}` });
//       }
//       const price = product.price * products[i].quantity;
//       totalAmount += price;
//       orderProducts.push({
//         productId: products[i].productId,
//         quantity: products[i].quantity,
//         price: price,
//       });
//     }
//     const newOrder = new Order({
//       userId,
//       products: orderProducts,
//       totalAmount,
//     });
//     await newOrder.save();

//     await publishMessage("orderQueue", {
//       orderId: newOrder._id,
//       userId: newOrder.userId,
//       products: newOrder.products,
//       totalAmount: newOrder.totalAmount,
//     });

//     res
//       .status(201)
//       .json({ message: "Order placed successfully...", order: newOrder });
//   } catch (error) {
//     console.log("Error while placing order:", error);
//     res.status(500).json({ message: "Failed to place order", error });
//   }
// };

const placeOrder = async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const { products } = req.body;

  try {
    let totalAmount = 0;
    const orderProducts = [];

    for (let p of products) {
      const response = await axios.get(
        `http://product-service:1235/api/products/getProduct/${p.productId}`
      );
      const product = response.data;

      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (product.stock < p.quantity)
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });

      const price = product.price * p.quantity;
      totalAmount += price;

      orderProducts.push({
        productId: p.productId,
        quantity: p.quantity,
        price,
      });
    }

    const newOrder = new Order({
      userId,
      products: orderProducts,
      totalAmount,
    });
    await newOrder.save();

    await publishOrder({
      orderId: newOrder._id,
      userId,
      email: userEmail,
      products: orderProducts,
      totalAmount,
    });

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order", error });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    // .populate("userId", "email") // Populate user details
    // .populate("products.productId", "name price"); // Populate product details

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json(order);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params; // Order ID
    const { products, status } = req.body; // Expect products array and/or status

    let order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let totalAmount = 0;
    let orderProducts = [];

    // If products are provided, recalculate total
    if (products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const response = await axios.get(
          `http://product-service:1235/api/products/getProduct/${products[i].productId}`
        );
        const product = response.data;

        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${products[i].productId} not found` });
        }

        if (product.stock < products[i].quantity) {
          return res.status(400).json({
            message: `Insufficient stock for product ${product.name}`,
          });
        }

        const price = product.price * products[i].quantity;
        totalAmount += price;

        orderProducts.push({
          productId: products[i].productId,
          quantity: products[i].quantity,
          price: price,
        });
      }

      order.products = orderProducts;
      order.totalAmount = totalAmount;
    }

    // If status is provided, update it
    if (status) {
      order.status = status;
    }

    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete order by ID
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order deleted successfully", order: deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
