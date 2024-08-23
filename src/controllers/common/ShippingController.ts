import { Request, Response } from "express";
import axios from "axios";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
// import { getRepository } from "typeorm";
// import { Order } from "../entities/Order"; // Adjust the import path as needed

// Define interfaces for the request payload
interface ProductDetail {
  name: string;
  sku_number: string;
  quantity: number;
  discount: string;
  hsn: string;
  unit_price: number;
  product_category: string;
}

interface PushOrderPayload {
  order_id: string;
  order_date: string;
  order_type: string;
  consignee_name: string;
  consignee_phone: number;
  consignee_alternate_phone: number;
  consignee_email: string;
  consignee_address_line_one: string;
  consignee_address_line_two: string;
  consignee_pin_code: number;
  consignee_city: string;
  consignee_state: string;
  product_detail: ProductDetail[];
  payment_type: string;
  cod_amount: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  warehouse_id: string;
  gst_ewaybill_number: string;
  gstin_number: string;
}

// Controller function to push order to Shipmozo
export async function pushOrderToShipmozo(req: Request, res: Response) {
  const url = "https://shipping-api.com/app/api/v1/push-order";
  const headers = {
    accept: "application/json",
    "public-key": "QAT3F5reixLjyhUZWv7C",
    "private-key": "mkxJlC2vW5Oo9rpGQ0iR",
    "Content-Type": "application/json",
    "X-CSRF-TOKEN": "",
  };

  const { order_id } = req.body;

  try {
    // Fetch the order from your database
    const orderRepository = appDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: order_id },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    console.log("order get", order);

    const shippingData = {
      order_id: "",
      order_date: "2024-01-06",
      order_type: "ESSENTIALS",
      consignee_name: "arslan",
      consignee_phone: "1234567890",
      consignee_alternate_phone: "",
      consignee_email: "",
      consignee_address_line_one: "address first",
      consignee_address_line_two: "",
      consignee_pin_code: "110037",
      consignee_city: "",
      consignee_state: "",
      product_detail: [
        {
          name: "product",
          sku_number: "",
          quantity: "1",
          discount: "",
          hsn: "",
          unit_price: "100",
          product_category: "",
        },
      ],
      payment_type: "PREPAID",
      cod_amount: "",
      weight: "0.1",
      length: "1",
      width: "2",
      height: "1",
      warehouse_id: "",
      gst_ewaybill_number: "",
      gstin_number: "",
    };

    // Push the order to Shipmozo
    const response = await axios.post(url, shippingData, { headers });
    console.log("🚀 ~ pushOrderToShipmozo ~ response:", response);
    const { data } = response;

    if (data.result === "1") {
      res.status(200).json({
        message: "Order pushed successfully",
        data: data.data,
      });
    } else {
      res.status(400).json({
        message: "Failed to push order",
        error: data.message,
      });
    }
  } catch (error: any) {
    console.error("Error pushing order:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
