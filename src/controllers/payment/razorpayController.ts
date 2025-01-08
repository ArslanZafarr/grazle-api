// razorpayController.ts
import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { User } from "../../entities/Users";
import {
  sendMembershipActivationEmail,
  sendOrderConfirmationEmail,
} from "../../services/emailService";
import { UserMembership } from "../../entities/UserMembership";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_6LRUD8K8zZJ0sR", // Replace with your Razorpay Key ID
  key_secret: "DSYk8sszJPG2MVdvFa04aKiX", // Replace with your Razorpay Key Secret
});

// For product payment

// Controller for creating an order
export const createOrder = async (req: Request, res: Response) => {
  const { amount, order_id } = req.body; // Get amount and order_id from the request body (amount in INR)

  try {
    // Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Amount should be in paise (100 paise = 1 INR)
      currency: "INR",
      receipt: order_id, // Use your custom order_id here
    });

    // Send the order details back to the client
    res.status(200).json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      order_id: order_id, // Include your custom order ID in the response
      amount: razorpayOrder.amount,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);

    // Send an appropriate error response
    res.status(500).json({
      success: false,
      error: "Failed to create Razorpay order",
      message: error || "Something went wrong",
    });
  }
};

// Controller to verify payment signature
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Validate request body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: razorpay_order_id, razorpay_payment_id, or razorpay_signature",
      });
    }

    // Generate the expected signature using the secret key
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac("sha256", "DSYk8sszJPG2MVdvFa04aKiX") // Use RazorpayConfig for security
      .update(body)
      .digest("hex");

    // Compare the generated signature with the one sent by Razorpay
    if (expected_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const orderRepo = appDataSource.getRepository(Order);

    // Fetch the order to update
    const order = await orderRepo.findOne({
      where: { transaction_id: razorpay_order_id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found with the provided transaction ID",
      });
    }

    // Update order payment status and save
    order.payment = "paid";
    order.updated_at = new Date();
    const updatedOrder = await orderRepo.save(order);

    const userRepo = appDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: updatedOrder.user_id },
    });

    if (user && user.email) {
      await sendOrderConfirmationEmail(
        user.email,
        updatedOrder?.tracking_id || ""
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order updated successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the payment",
    });
  }
};

// For membership payment

// Controller for creating an order
export const createOrderForMembership = async (req: Request, res: Response) => {
  const { amount, order_id } = req.body; // Get amount and order_id from the request body (amount in INR)

  try {
    // Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Amount should be in paise (100 paise = 1 INR)
      currency: "INR",
      receipt: order_id, // Use your custom order_id here
    });

    // Send the order details back to the client
    res.status(200).json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      order_id: order_id, // Include your custom order ID in the response
      amount: razorpayOrder.amount,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);

    // Send an appropriate error response
    res.status(500).json({
      success: false,
      error: "Failed to create Razorpay order",
      message: error || "Something went wrong",
    });
  }
};

// Controller to verify payment signature
export const verifyPaymentForMembership = async (
  req: Request,
  res: Response
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Validate request body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: razorpay_order_id, razorpay_payment_id, or razorpay_signature",
      });
    }

    // Generate the expected signature using the secret key
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac("sha256", "DSYk8sszJPG2MVdvFa04aKiX") // Use RazorpayConfig for security
      .update(body)
      .digest("hex");

    // Compare the generated signature with the one sent by Razorpay
    if (expected_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const userMembershipRepo = appDataSource.getRepository(UserMembership);

    // Find membership by id and load the membership_plan and user relation
    const membership = await userMembershipRepo.findOne({
      where: { transaction_id: razorpay_order_id },
      relations: ["membership_plan", "user"],
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    const membershipPlan = membership.membership_plan;
    if (!membershipPlan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    const userId = membership.user?.id;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User associated with membership not found",
      });
    }

    // Calculate start and end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + membershipPlan.duration_months);

    // Update payment status to "paid"
    // membership.transaction_id = paymentTrackingId;
    membership.payment_status = "paid";
    membership.is_active = true;
    membership.start_date = startDate;
    membership.end_date = endDate;
    membership.status = "active";

    const updatedMembershipPlan = await userMembershipRepo.save(membership);

    const userRepo = appDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
    });

    if (user && user.email) {
      try {
        await sendMembershipActivationEmail(
          user.email,
          updatedMembershipPlan.membership_plan.name,
          updatedMembershipPlan.start_date,
          updatedMembershipPlan.end_date
        );
      } catch (emailError) {
        console.error("Error sending membership activation email:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the payment",
    });
  }
};
