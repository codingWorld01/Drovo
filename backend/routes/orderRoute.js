
import express from "express"
import authMiddleware from "../middlewares/auth.js"
import { createOrder, feedback, findOrder, listOrders, placeOrder, updateStatus, userOrders, verifyPayment } from "../controller/orderController.js"
import shopAuthMiddleware from "../middlewares/shopAuthMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post('/create-order', authMiddleware, createOrder);
orderRouter.post('/verify', authMiddleware, verifyPayment);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", shopAuthMiddleware, listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/feedback", feedback);
orderRouter.get("/:id", authMiddleware, findOrder);

export default orderRouter;
