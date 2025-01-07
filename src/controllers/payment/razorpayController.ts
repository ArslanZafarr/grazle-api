// razorpayController.ts
import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_test_6LRUD8K8zZJ0sR', // Replace with your Razorpay Key ID
  key_secret: 'DSYk8sszJPG2MVdvFa04aKiX', // Replace with your Razorpay Key Secret
});

// Controller for creating an order
export const createOrder = async (req: Request, res: Response) => {
  const { amount } = req.body; // Amount from the request body (in INR)

  try {
    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount should be in paise (100 paise = 1 INR)
      currency: 'INR',
      receipt: `order_receipt_${new Date().getTime()}`,
    });

    // Send the order details back to the client
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ error: 'Failed to create order' });
  }
};

// Controller to verify payment signature
export const verifyPayment = (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Generate the expected signature using the secret key
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected_signature = crypto
    .createHmac('sha256', 'DSYk8sszJPG2MVdvFa04aKiX') // Replace with your Razorpay Key Secret
    .update(body)
    .digest('hex');

  // Compare the generated signature with the one sent by Razorpay
  if (expected_signature === razorpay_signature) {
    res.status(200).send({ message: 'Payment verified successfully' });
  } else {
    res.status(400).send({ message: 'Invalid signature' });
  }
};
