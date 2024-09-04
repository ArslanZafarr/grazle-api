import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Notification } from "../../entities/Notification";

export class NotificationController {
  getUserNotifications = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const notificationRepo = appDataSource.getRepository(Notification);

    try {
      // Use QueryBuilder for complex conditions
      const notifications = await notificationRepo
        .createQueryBuilder("notification")
        .where("notification.user_id = :userId", { userId })
        .orWhere("notification.user_id IS NULL")
        .orderBy("notification.created_at", "DESC")
        .take(10)
        .getMany();

      return res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  seeAllNotifications = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10); // Convert to number
    const notificationRepo = appDataSource.getRepository(Notification);

    try {
      // Use QueryBuilder for more complex conditions
      const notifications = await notificationRepo
        .createQueryBuilder("notification")
        .where("notification.user_id = :userId", { userId })
        .orWhere("notification.user_id IS NULL")
        .orderBy("notification.created_at", "DESC")
        .getMany();

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