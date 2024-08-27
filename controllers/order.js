import Order from "../models/order.js";
import Razorpay from "razorpay";
import Product from "../models/product.js";
import crypto from "crypto";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

const OrdersController = {
  getOrders: async (req, res) => {
    try {
      // if (!req.query.page || !req.query.limit)
      //   throw new Error("Page, Limit is required !");

      const skipUsers = (req.query.page - 1) * req.query.limit;
      const ITEM_PER_PAGE = req.query.page * req.query.limit;

      const orders = await Order.find({
        ...(req.query.isDelivered
          ? { isDelivered: req.query.isDelivered === "true" ? true : false }
          : {}),
        ...(req.query.isPaid
          ? { isPaid: req.query.isPaid === "true" ? true : false }
          : {}),
        ...(req.query.mode ? { mode: req.query.mode } : {}),
      })
        .sort({ priority: -1, createdAt: -1 })
        .skip(skipUsers)
        .limit(req.query.limit);

      const totalOrders = await Order.find({
        ...(req.query.isDelivered
          ? { isDelivered: req.query.isDelivered === "true" ? true : false }
          : {}),
        ...(req.query.isPaid
          ? { isPaid: req.query.isPaid === "true" ? true : false }
          : {}),
        ...(req.query.mode ? { mode: req.query.mode } : {}),
      }).count();

      res.status(200).send({
        succss: true,
        message: orders,
        totalOrders,
        hasNextPage: ITEM_PER_PAGE < totalOrders,
        hasPreviousPage: req.query.page > 1,
      });
    } catch (error) {
      res.status(400).json({ message: error });
    }
  },
  getOrder: async (req, res) => {
    try {
      const data = await Order.find({user:req.params._id});
      return res.status(200).json({ message: data });
    } catch (error) {
      res.status(400).json({ message: err.message });
    }
  },
  createOrder: async (req, res) => {
    try {
      const { billingDetails, paymentMethod, total, discount, cartData, user } = req.body;
      console.log(billingDetails, paymentMethod, total, discount, cartData);
  
      // Validate the request body
      if (!billingDetails || !paymentMethod || !total || !cartData || !user) {
        throw new Error("billingDetails, paymentMethod, total, and cartData are required!");
      }
  
      // Calculate total amount for verification (optional step)
      const calculatedTotal = cartData.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  
      // Create the order in the database
      await Order.create({
        billingDetails,
        paymentMethod,
        total,
        discount,
        cartData,
        user,
      });
  
      // Return a success response to the client
      return res.status(201).json({ message: "Order created successfully" });
  
    } catch (err) {
      // Handle errors
      res.status(400).json({ message: err.message });
    }
  },
  
  updateOrder: async (req, res) => {
    try {
      let params = { ...req.body };

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params._id,
        params,
        { new: true }
      );

      return res.status(200).json({ message: updatedOrder, status: true });
    } catch (error) {
      res.status(400).json({ message: err.message });
    }
  },
  paymentVerification: async (req, res) => {
    try {
      const { paymentId, orderId, razorpaySignature } = req.body;

      if (!paymentId || !orderId || !razorpaySignature)
        throw new Error(
          "paymentId, orderId or razorpaySignature is missing in body!"
        );

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest("hex");

      if (expectedSignature !== razorpaySignature)
        throw new Error("Payment Not Verifed! Something went wrong");

      await Order.findOneAndUpdate(
        {
          orderId,
        },
        {
          isPaid: true,
        }
      );

      res.status(200).json({ message: "your payment is verified" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  },
};

export default OrdersController;
