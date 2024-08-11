// import { Request, Response } from "express";
// import * as CryptoJS from "crypto-js";

// class PaymentController {
//   private workingKey: string = "7968E3A397D81CDC3191EE0A3E5F9671";
//   private accessCode: string = "AVGV26KJ84CK39VGKC";

//   public postRequest = (req: Request, res: Response): void => {
//     const {
//       order_id,
//       currency,
//       amount,
//       redirect_url,
//       cancel_url,
//       language = "EN",
//     } = req.body;

//     // Convert body to string format
//     const body = JSON.stringify({
//       merchant_id: "2545596",
//       order_id,
//       currency,
//       amount,
//       redirect_url,
//       cancel_url,
//       language,
//     });

//     // Encrypt the request
//     const encRequest = this.encrypt(body, this.workingKey);

//     // Send the encrypted request and access code to the client
//     res.json({
//       encRequest,
//       accessCode: this.accessCode,
//       ccavenueUrl:
//         "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
//     });
//   };

//   public postResponse = (req: Request, res: Response): void => {
//     const { encResp } = req.body;

//     // Decrypt the response using the working key
//     const decryptedResponse = this.decrypt(encResp, this.workingKey);

//     // Parse the decrypted response
//     const parsedResponse = decryptedResponse
//       .split("&")
//       .map((param) => param.split("="))
//       .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
//       .join("");

//     // Create the HTML response
//     const htmlResponse = `
//       <html>
//         <head>
//           <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//           <title>Response Handler</title>
//         </head>
//         <body>
//           <center>
//             <font size="4" color="blue"><b>Response Page</b></font>
//             <br>
//             <table border="1" cellspacing="2" cellpadding="2">
//               ${parsedResponse}
//             </table>
//           </center>
//           <br>
//         </body>
//       </html>
//     `;

//     // Send the HTML response
//     res.status(200).send(htmlResponse);
//   };

//   private encrypt = (plainText: string, workingKey: string): string => {
//     try {
//       const key = CryptoJS.MD5(workingKey);
//       const iv = CryptoJS.enc.Utf8.parse(
//         "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
//       );
//       const encrypted = CryptoJS.AES.encrypt(plainText, key, {
//         iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//       });
//       return encrypted.toString();
//     } catch (error) {
//       console.error("Encryption failed:", error);
//       throw new Error("Encryption failed");
//     }
//   };

//   private decrypt = (encText: string, workingKey: string): string => {
//     try {
//       const key = CryptoJS.MD5(workingKey);
//       const iv = CryptoJS.enc.Utf8.parse(
//         "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
//       );
//       const decrypted = CryptoJS.AES.decrypt(encText, key, {
//         iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//       });
//       return decrypted.toString(CryptoJS.enc.Utf8);
//     } catch (error) {
//       console.error("Decryption failed:", error);
//       throw new Error("Decryption failed");
//     }
//   };
// }

// export default new PaymentController();

import { Request, Response } from "express";
import * as CryptoJS from "crypto-js";
import dotenv from "dotenv";
import { validationResult } from "express-validator";

dotenv.config(); // Load environment variables

class PaymentController {
  private workingKey: string = process.env.CCAVENUE_WORKING_KEY || "";
  private accessCode: string = process.env.CCAVENUE_ACCESS_CODE || "";
  private merchantId: string = process.env.CCAVENUE_MERCHANT_ID || "";

  public postRequest = (req: Request, res: Response) => {
    // Validation Error Handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const result = errors.mapped();

      const formattedErrors: Record<string, string[]> = {};
      for (const key in result) {
        formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
          result[key].msg,
        ];
      }

      const errorCount = Object.keys(result).length;
      const errorSuffix =
        errorCount > 1
          ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
          : "";

      const errorResponse = {
        success: false,
        message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
        errors: formattedErrors,
      };

      return res.status(400).json(errorResponse);
    }
    const {
      order_id,
      currency,
      amount,
      redirect_url,
      cancel_url,
      language = "EN",
    } = req.body;

    // Convert body to form string format
    const body = `merchant_id=${this.merchantId}&order_id=${order_id}&currency=${currency}&amount=${amount}&redirect_url=${redirect_url}&cancel_url=${cancel_url}&language=${language}`;

    // Encrypt the request
    const encRequest = this.encrypt(body, this.workingKey);

    // Send the encrypted request and access code to the client
    res.json({
      encRequest,
      accessCode: this.accessCode,
      ccavenueUrl:
        "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    });
  };

  public postResponse = (req: Request, res: Response) => {
    // Validation Error Handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const result = errors.mapped();

      const formattedErrors: Record<string, string[]> = {};
      for (const key in result) {
        formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
          result[key].msg,
        ];
      }

      const errorCount = Object.keys(result).length;
      const errorSuffix =
        errorCount > 1
          ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
          : "";

      const errorResponse = {
        success: false,
        message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
        errors: formattedErrors,
      };

      return res.status(400).json(errorResponse);
    }
    const { encResp } = req.body;

    try {
      // Decrypt the response using the working key
      const decryptedResponse = this.decrypt(encResp, this.workingKey);

      // Parse the decrypted response into an object
      const responseParams = decryptedResponse
        .split("&")
        .map((param) => param.split("="))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      // Send the parsed response as JSON
      res.status(200).json({
        success: true,
        message: "Payment response received successfully",
        data: responseParams,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to process payment response",
        error: error.message,
      });
    }
  };

  private encrypt = (plainText: string, workingKey: string): string => {
    try {
      const key = CryptoJS.MD5(workingKey);
      const iv = CryptoJS.enc.Utf8.parse(
        "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
      );
      const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Encryption failed");
    }
  };

  private decrypt = (encText: string, workingKey: string): string => {
    try {
      const key = CryptoJS.MD5(workingKey);
      const iv = CryptoJS.enc.Utf8.parse(
        "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
      );
      const decrypted = CryptoJS.AES.decrypt(encText, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Decryption failed");
    }
  };
}

export default new PaymentController();
