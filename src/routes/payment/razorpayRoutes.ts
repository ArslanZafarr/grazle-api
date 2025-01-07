// razorpayRoutes.ts
import express from 'express';
import { createOrder, verifyPayment } from '../../controllers/payment/razorpayController';

const router = express.Router();

// Route to create an order
router.post('/create-order', createOrder);

// Route to verify the payment
router.post('/verify-payment', verifyPayment);

export default router;
