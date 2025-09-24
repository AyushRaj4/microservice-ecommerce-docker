const { consumeMessage } = require("./utils/rabbitMQ");
const sendMail = require("./utils/mailer");

async function handleOrderMessage(message) {
  try {
    console.log("📩 Processing order for email:", message.email);

    if (!message.email) {
      console.warn("⚠️ No email provided in order message:", message);
      return;
    }

    await sendMail(
      message.email,
      "Order Placed ✅",
      `Your order ${message.orderId} has been successfully placed!`
    );

    console.log("📧 Email sent to:", message.email);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

function startConsumer() {
  consumeMessage("orderConsumerQueue", handleOrderMessage);
}

module.exports = startConsumer;
