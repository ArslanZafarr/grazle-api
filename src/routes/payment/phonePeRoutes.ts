import { Router } from "express";
import {
  initiatePayment,
  handleCallback,
} from "../../controllers/payment/PhonePeController";
import { body } from "express-validator";

const router = Router();

router.post(
  "/initiate-payment",
  [
    body("user_id").notEmpty().withMessage("The user_id field is required"),
    body("amount").notEmpty().withMessage("The amount field is required"),
    body("redirect_url")
      .notEmpty()
      .withMessage("The redirect_url field is required"),
    body("redirect_mode")
      .notEmpty()
      .withMessage("The redirect_mode field is required"),
  ],
  initiatePayment
);

// Route to handle the callback from PhonePe
router.post("/callback", handleCallback);

export default router;
