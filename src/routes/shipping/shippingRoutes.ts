import { Router } from "express";
import { pushOrderToShipmozo } from "../../controllers/common/ShippingController";

const router = Router();

router.post("/push-order", pushOrderToShipmozo);

export default router;
