import orderModel from "../models/orderModel.js";
import userModel from "../models/UserModel.js";
import Shop from "../models/ShopModel.js";
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getShopIdFromToken = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

// Create Razorpay order for online payment with transfer details
const createOrder = async (req, res) => {
  const { amount, deliveryCharge, token, shopId } = req.body;

  if (!token || !shopId) {
    return res.status(401).json({ success: false, message: 'Unauthorized request or missing shopId' });
  }

  try {
    const shop = await Shop.findById(shopId);
    if (!shop || !shop.razorpayAccountId) {
      return res.status(400).json({ success: false, message: 'Shop not found or no linked account' });
    }

    const totalAmount = (amount + deliveryCharge) * 100; // Convert to paise
    const shopAmount = Math.round(totalAmount * 0.99); // 99% to shopkeeper
    const platformCommission = totalAmount - shopAmount; // 1% to platform

    const options = {
      amount: totalAmount,
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
      transfers: [
        {
          account: shop.razorpayAccountId,
          amount: shopAmount,
          currency: 'INR',
          notes: {
            purpose: 'Order payment to shopkeeper'
          }
        }
      ]
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      platformCommission // Return commission for tracking
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order' });
  }
};

// Verify Razorpay payment and save order
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    items,
    amount,
    address,
    deliveryCharge,
    shopId
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment details' });
  }

  try {
    // Verify payment signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Save order
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      deliveryCharge,
      shopId,
      paymentMethod: 'Online',
      paymentStatus: 'Completed',
      paymentDetails: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentDate: new Date(),
        platformCommission: Math.round((amount + deliveryCharge) * 0.01) // 1% commission
      },
    });

    const order = await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Fetch shop details for notification
    const shopDetails = await Shop.findById(shopId);
    if (!shopDetails) {
      return res.status(404).json({ success: false, message: "Shop not found." });
    }

    // Send email notification to shopkeeper
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const shopAmount = (amount + deliveryCharge) * 0.99;
    const platformCommission = (amount + deliveryCharge) * 0.01;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: shopDetails.email,
      subject: 'New Order Placed',
      text: `Hello ${shopDetails.name},\n\nA new order has been placed at your shop!\n\nOrder Details:\n- Amount: ₹${amount}\n- Delivery Charge: ₹${deliveryCharge}\n- Payment Method: Online\n- Amount to Shopkeeper: ₹${shopAmount.toFixed(2)}\n- Platform Commission (1%): ₹${platformCommission.toFixed(2)}\n- User Address: ${address.street}\n\nPlease check your admin panel for more details.\n\nThank you for using Drovo!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error while verifying payment' });
  }
};

// Place order (for COD)
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      deliveryCharge: req.body.deliveryCharge,
      shopId: req.body.shopId,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      paymentDetails: {
        platformCommission: Math.round((req.body.amount + req.body.deliveryCharge) * 0.01) // 1% commission
      },
    });

    const order = await newOrder.save();

    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const shopDetails = await Shop.findById(req.body.shopId);
    if (!shopDetails) {
      return res.status(404).json({ success: false, message: "Shop not found." });
    }

    const shopAmount = (req.body.amount + req.body.deliveryCharge) * 0.99;
    const platformCommission = (req.body.amount + req.body.deliveryCharge) * 0.01;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: shopDetails.email,
      subject: 'New Order Placed',
      text: `Hello ${shopDetails.name},\n\nA new order has been placed at your shop!\n\nOrder Details:\n- Amount: ₹${req.body.amount}\n- Delivery Charge: ₹${req.body.deliveryCharge}\n- Payment Method: Cash on Delivery\n- Amount to Shopkeeper: ₹${shopAmount.toFixed(2)}\n- Platform Commission (1%): ₹${platformCommission.toFixed(2)}\n- User Address: ${req.body.address.street}\n\nPlease remit the platform commission to Drovo at the end of the month.\n\nPlease check your admin panel for more details.\n\nThank you for using Drovo!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order." });
  }
};

const findOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shop = await Shop.findById(order.shopId);

    res.status(200).json({
      success: true,
      order,
      shop,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const feedback = async (req, res) => {
  const { name, email, rating, message, shopEmail } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: shopEmail,
    subject: `Feedback from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Rating: ${rating}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: 'Failed to send feedback' });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const listOrders = async (req, res) => {
  const { token } = req.headers;
  let shopId = getShopIdFromToken(token);

  if (!shopId) {
    return res.status(400).json({ success: false, message: "Shop ID is required" });
  }

  try {
    const orders = await orderModel.find({ shopId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, userOrders, listOrders, updateStatus, findOrder, feedback, createOrder, verifyPayment };