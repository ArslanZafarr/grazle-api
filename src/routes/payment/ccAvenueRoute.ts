import { Router } from "express";
import {
  handlePaymentResponse,
  initiatePayment,
} from "../../controllers/payment/ccAvenueController";
import { parsing } from "../../config/parseMulter";

const router = Router();

router.post("/initiate-payment", parsing, initiatePayment);
router.post("/handle-payment-response", parsing, handlePaymentResponse);

export default router;
