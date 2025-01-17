import express from "express";
import { AddressController } from "../../controllers/buyer/AddressController";
import { body } from "express-validator";
import { buyerMiddleware } from "../../middleware/buyerMiddleware";
import { parsing } from "../../config/parseMulter";
import { OrderController } from "../../controllers/buyer/OrderController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router();

const addressesController = new AddressController();

router.get("/addresses", buyerMiddleware, addressesController.getAll);
router.get("/addresses/:id", buyerMiddleware, addressesController.getById);
router.post(
  "/addresses",
  buyerMiddleware,
  parsing,
  [
    body("address").notEmpty().withMessage("The address field is required"),
    body("address_label")
      .notEmpty()
      .withMessage("The address_label field is required"),

    body("recipient_name")
      .notEmpty()
      .withMessage("The recipient_name field is required"),

    body("recipient_phone")
      .notEmpty()
      .withMessage("The recipient_phone field is required"),

    body("pin_code")
      .notEmpty()
      .withMessage("The pin_code field is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("The pin_code must be 6 digits long")
      .matches(/^\d+$/)
      .withMessage("The pin_code must be a numeric value"),
  ],
  addressesController.create
);
router.put(
  "/addresses/:id",
  buyerMiddleware,
  parsing,
  addressesController.update
);
router.delete("/addresses/:id", buyerMiddleware, addressesController.delete);
router.put(
  "/addresses/:id/setPrimary",
  buyerMiddleware,
  addressesController.setPrimaryAddress
);

// Buyer Order Routes

const orderController = new OrderController();
router.get("/buyer/orders", authMiddleware, orderController.getAllOrders);
router.get(
  "/buyer/orders-default",
  authMiddleware,
  orderController.getAllOrdersWithoutPagination
);
router.get(
  "/buyer/multi-orders/:ref_id",
  authMiddleware,
  orderController.getMultiOrderByRefId
);
router.get("/buyer/orders/:id", authMiddleware, orderController.getOrderById);
router.post(
  "/buyer/orders",
  authMiddleware,
  parsing,
  [
    body("address_id")
      .notEmpty()
      .withMessage("The address_id field is required"),

    body("payment_type")
      .notEmpty()
      .withMessage("The payment_type field is required"),
    body("prices").notEmpty().withMessage("The prices field is required"),
  ],
  orderController.createOrder
);
router.put("/buyer/orders/:id", authMiddleware, orderController.updateOrder);
router.delete("/buyer/orders/:id", authMiddleware, orderController.deleteOrder);

router.post(
  "/buyer/cancel-order",
  authMiddleware,
  parsing,
  [body("order_id").notEmpty().withMessage("The order_id field is required")],
  orderController.cancelThisOrder
);

router.get(
  "/buyer/orders/:id/cancel",
  authMiddleware,
  orderController.cancelOrder
);

router.get(
  "/buyer/orders/:id/track-status",
  authMiddleware,
  orderController.trackOrderStatus
);
router.put(
  "/buyer/orders/:id/payment-status",
  authMiddleware,
  parsing,
  [
    body("payment_status")
      .notEmpty()
      .withMessage("The payment_status field is required"),
    body("transaction_id")
      .notEmpty()
      .withMessage("The transaction_id field is required"),
  ],
  orderController.updatePaymentStatus
);

router.put(
  "/buyer/order-transaction/:id/update",
  authMiddleware,
  parsing,
  [
    body("transaction_id")
      .notEmpty()
      .withMessage("The transaction_id field is required"),
  ],
  orderController.updateOrderTransactionId
);

export default router;
