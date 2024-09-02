import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Notification } from "../../entities/Notification";
import { FindOperator, IsNull } from "typeorm";

export class NotificationController {
  getUserNotifications = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10); // Convert to number
    const notificationRepo = appDataSource.getRepository(Notification);

    try {
      // Find notifications either specific to the user or with no specific user
      const notifications = await notificationRepo.find({
        where: [
          { user_id: userId as number | FindOperator<number> }, // Notifications specific to the user
          { user_id: IsNull() }, // Notifications with no specific user
        ],
        order: { created_at: "DESC" },
        take: 10, // Limit the results to the latest 10 notifications
      });

      return res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  seeAllNotifications = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10); // Convert to number
    const notificationRepo = appDataSource.getRepository(Notification);

    try {
      // Find notifications either specific to the user or with no specific user
      const notifications = await notificationRepo.find({
        where: [
          { user_id: userId as number | FindOperator<number> }, // Notifications specific to the user
          { user_id: IsNull() }, // Notifications with no specific user
        ],
        order: { created_at: "DESC" },
      });

      return res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

// Create a new notification
//   createNotification = async (
//     userId: number,
//     title: string,
//     body: string,
//     data: any,
//     url: string,
//     image: string
//   ) => {
//     const notificationRepo = appDataSource.getRepository(Notification);

//     const notification = new Notification();
//     notification.user_id = userId;
//     notification.title = title;
//     notification.body = body;
//     notification.data = data;
//     notification.url = url;
//     notification.image = image;

//     await notificationRepo.save(notification);
//     return notification;
//   };

//   // Send notification to a specific user
//   sendNotificationToUser = async (req: Request, res: Response) => {
//     const userId = (req as any).user.id;
//     const { title, body, data, image, url } = req.body;

//     // Validation Error Handling
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const notification = await this.createNotification(
//         userId,
//         title,
//         body,
//         data,
//         url,
//         image
//       );

//       return res.status(201).json({
//         success: true,
//         message: "Notification sent successfully",
//         notification,
//       });
//     } catch (error) {
//       console.error("Error sending notification:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
