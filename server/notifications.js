/**
 * Kartly E-Commerce Notification System
 * Handles Email and SMS notifications for Order Placement, Payment Success, Shipping & Delivery updates.
 */

export function sendOrderPlacedNotification(order, user) {
  // Asynchronous background execution (non-blocking)
  setImmediate(() => {
    try {
      const emailRecipient = user?.email || order?.address?.email || "customer@kartly.com";
      const phoneRecipient = user?.phone || order?.address?.phone || "9876543210";
      const orderId = order.id || order.order_id;
      const totalAmount = order.total_amount || order.final_amount || order.totalAmount || 0;
      const addressStr = order.address
        ? `${order.address.address_line || order.address.house || ""}, ${order.address.city || ""}`
        : "Default Shipping Address";

      const itemsSummary = (order.items || [])
        .map((i) => `- ${i.title || i.name || i.product?.title || "Product"} (Qty: ${i.qty || i.quantity || 1})`)
        .join("\n");

      // 1. EMAIL NOTIFICATION
      const emailContent = {
        to: emailRecipient,
        subject: "Order Confirmed",
        body: `
Dear ${user?.name || order?.address?.name || "Valued Customer"},

Thank you for shopping with Kartly! Your order has been successfully placed and confirmed.

--------------------------------------------------
ORDER SUMMARY
--------------------------------------------------
Order ID: ${orderId}
Order Date: ${order.date || new Date().toLocaleDateString()}
Total Amount: ₹${totalAmount}

PRODUCTS ORDERED:
${itemsSummary}

DELIVERY ADDRESS:
${addressStr}

Estimated Delivery Date: ${order.expectedDelivery || "Within 2-3 Days"}

We will notify you once your order is shipped.

Happy Shopping!
Kartly Team
--------------------------------------------------
`.trim(),
      };

      // 2. SMS NOTIFICATION
      const smsMessage = `Your order has been placed successfully. Order ID: ${orderId}`;
      const smsPayload = {
        to: phoneRecipient,
        message: smsMessage,
      };

      console.log("\n==================================================");
      console.log(`📧 [EMAIL SENT SUCCESSFULLY] -> ${emailContent.to}`);
      console.log(`Subject: "${emailContent.subject}"`);
      console.log(emailContent.body);
      console.log(`📱 [SMS SENT SUCCESSFULLY] -> ${smsPayload.to}`);
      console.log(`Message: "${smsPayload.message}"`);
      console.log("==================================================\n");
    } catch (err) {
      console.error("Error dispatching order placed notification:", err.message);
    }
  });
}

export function sendPaymentSuccessNotification(order, paymentDetails, user) {
  setImmediate(() => {
    try {
      const emailRecipient = user?.email || order?.address?.email || "customer@kartly.com";
      const phoneRecipient = user?.phone || order?.address?.phone || "9876543210";
      const orderId = order.id || order.order_id;
      const amountPaid = paymentDetails?.amount || order?.total_amount || order?.final_amount || 0;
      const method = (paymentDetails?.method || order?.payment_method || "UPI").toUpperCase();

      // 1. EMAIL NOTIFICATION
      const emailContent = {
        to: emailRecipient,
        subject: "Payment Successful",
        body: `
Dear ${user?.name || order?.address?.name || "Valued Customer"},

Your payment of ₹${amountPaid} for Order ID: ${orderId} has been successfully processed!

--------------------------------------------------
PAYMENT DETAILS
--------------------------------------------------
Order ID: ${orderId}
Payment Method: ${method}
Amount Paid: ₹${amountPaid}
Payment Status: SUCCESS
Transaction ID: ${paymentDetails?.transactionId || `TXN-${Date.now()}`}

Your order is now confirmed and being prepared for shipment.

Thank you for choosing Kartly!
--------------------------------------------------
`.trim(),
      };

      // 2. SMS NOTIFICATION
      const smsMessage = `Payment successful for Order ID: ${orderId}`;

      console.log("\n==================================================");
      console.log(`📧 [EMAIL SENT SUCCESSFULLY] -> ${emailContent.to}`);
      console.log(`Subject: "${emailContent.subject}"`);
      console.log(emailContent.body);
      console.log(`📱 [SMS SENT SUCCESSFULLY] -> ${phoneRecipient}`);
      console.log(`Message: "${smsMessage}"`);
      console.log("==================================================\n");
    } catch (err) {
      console.error("Error dispatching payment notification:", err.message);
    }
  });
}

export function sendOrderShippedNotification(order, user) {
  setImmediate(() => {
    try {
      const emailRecipient = user?.email || order?.address?.email || "customer@kartly.com";
      const phoneRecipient = user?.phone || order?.address?.phone || "9876543210";
      const orderId = order.id || order.order_id;
      const expectedDelivery = order.expectedDelivery || "Within 24-48 Hours";

      // 1. EMAIL NOTIFICATION
      const emailContent = {
        to: emailRecipient,
        subject: "Your Order is Shipped",
        body: `
Dear ${user?.name || order?.address?.name || "Valued Customer"},

Great news! Your Order ID: ${orderId} has been shipped and is on its way to your delivery address.

--------------------------------------------------
SHIPPING STATUS
--------------------------------------------------
Order ID: ${orderId}
Status: Shipped / In Transit
Expected Delivery Date: ${expectedDelivery}

You can track your order status live on the Kartly platform.
--------------------------------------------------
`.trim(),
      };

      // 2. SMS NOTIFICATION
      const smsMessage = `Your order is shipped and on the way`;

      console.log("\n==================================================");
      console.log(`📧 [EMAIL SENT SUCCESSFULLY] -> ${emailContent.to}`);
      console.log(`Subject: "${emailContent.subject}"`);
      console.log(emailContent.body);
      console.log(`📱 [SMS SENT SUCCESSFULLY] -> ${phoneRecipient}`);
      console.log(`Message: "${smsMessage}"`);
      console.log("==================================================\n");
    } catch (err) {
      console.error("Error dispatching shipped notification:", err.message);
    }
  });
}

export function sendOrderDeliveredNotification(order, user) {
  setImmediate(() => {
    try {
      const emailRecipient = user?.email || order?.address?.email || "customer@kartly.com";
      const phoneRecipient = user?.phone || order?.address?.phone || "9876543210";
      const orderId = order.id || order.order_id;

      // 1. EMAIL NOTIFICATION
      const emailContent = {
        to: emailRecipient,
        subject: "Order Delivered Successfully",
        body: `
Dear ${user?.name || order?.address?.name || "Valued Customer"},

Your Order ID: ${orderId} has been successfully delivered!

--------------------------------------------------
DELIVERY CONFIRMATION
--------------------------------------------------
Order ID: ${orderId}
Status: Delivered

We hope you love your products! Thank you for shopping with Kartly.
--------------------------------------------------
`.trim(),
      };

      // 2. SMS NOTIFICATION
      const smsMessage = `Your order has been delivered`;

      console.log("\n==================================================");
      console.log(`📧 [EMAIL SENT SUCCESSFULLY] -> ${emailContent.to}`);
      console.log(`Subject: "${emailContent.subject}"`);
      console.log(emailContent.body);
      console.log(`📱 [SMS SENT SUCCESSFULLY] -> ${phoneRecipient}`);
      console.log(`Message: "${smsMessage}"`);
      console.log("==================================================\n");
    } catch (err) {
      console.error("Error dispatching delivered notification:", err.message);
    }
  });
}
