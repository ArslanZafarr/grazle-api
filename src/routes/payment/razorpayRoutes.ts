// razorpayRoutes.ts
import express from "express";
import {
  createOrder,
  createOrderForMembership,
  verifyPayment,
  verifyPaymentForMembership,
} from "../../controllers/payment/razorpayController";
import { parsing } from "../../config/parseMulter";

const router = express.Router();

// for product payment

// Route to create an order
router.post("/create-order", parsing, createOrder);

// Route to verify the payment
router.post("/verify-payment", parsing, verifyPayment);

// for membership payment

// Route to create an order
router.post("/membership/create-order", parsing, createOrderForMembership);

// Route to verify the payment
router.post("/membership/verify-payment", parsing, verifyPaymentForMembership);

export default router;
