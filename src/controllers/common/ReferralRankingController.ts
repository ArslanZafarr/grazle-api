import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { validationResult } from "express-validator";
import { Referral } from "../../entities/Referral";
import { User } from "../../entities/Users";
import { generateRandomString } from "../../helper/uniqueStringGenerator";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class ReferralRankingController {
  async createReferral(req: Request, res: Response) {
    try {
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

      const { sender_user_id } = req.body;
      const referralRepository = appDataSource.getRepository(Referral);
      const userRepository = appDataSource.getRepository(User);

      // Check if a referral already exists for the given sender_user_id
      let existingReferral = await referralRepository.findOne({
        where: { sender_user_id },
      });

      if (existingReferral) {
        return res.status(200).json({
          success: true,
          message: "Referral already exists for this user",
          referral: existingReferral,
        });
      }

      // Fetch user details to get username
      const user = await userRepository.findOne({
        where: { id: sender_user_id },
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Transform username to uppercase and replace spaces with dashes
      const userName = user.username.toUpperCase().replace(/\s+/g, "-");

      // Extract the first three letters of the username, transform them to uppercase, and handle cases where the username is too short
      const userNamePrefix = user.username.slice(0, 3).toUpperCase();

      // Generate a 7-character unique string
      const uniqueString = generateRandomString(7);

      // Construct the referral code with the prefix and the unique string
      const generatedRefCode = `${userNamePrefix}-${uniqueString}`;

      // Create the initial referral record
      let referral = referralRepository.create({
        sender_user_id,
        referral_link: "", // Initial placeholder
        referral_code: "",
        status: "sent",
      });

      // Save the referral
      const savedReferral = await referralRepository.save(referral);

      // Generate a unique link using the saved referral ID
      const uniqueLink = `http://grazle.co.in/registeration?ref_id=${userName}-${uniqueString}`;

      // Update the referral with the unique link
      savedReferral.referral_link = uniqueLink;
      savedReferral.referral_code = generatedRefCode;
      const updatedReferral = await referralRepository.save(savedReferral);

      res.status(201).json({
        success: true,
        message: "Referral created successfully",
        referral: updatedReferral,
      });
    } catch (error: any) {
      console.error("Error creating referral:", error.message);
      res.status(500).json({ error: "Failed to create referral" });
    }
  }

  async updateReferral(req: Request, res: Response) {
    try {
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

      const { referral_code, receiver_id } = req.body;

      const referralRepository = appDataSource.getRepository(Referral);

      // Find the referral by ID
      const referral = await referralRepository.findOne({
        where: { referral_code: referral_code },
      });

      if (!referral) {
        return res.status(404).json({
          success: false,
          error: "Referral not found",
        });
      }

      // Update referral status and receiver_id
      referral.status = "joined";
      if (receiver_id) {
        referral.receiver_id = receiver_id;
      }

      // Save the updated referral
      const updatedReferral = await referralRepository.save(referral);

      // Increment sender_user_id's score by 1
      const userRepository = appDataSource.getRepository(User);
      const senderUser = await userRepository.findOne({
        where: { id: referral.sender_user_id },
      });

      if (senderUser) {
        senderUser.score += 1; // Increment score
        const sender = await userRepository.save(senderUser); // Save updated score
      } else {
        console.error(
          "Sender user not found for referral:",
          referral.sender_user_id
        );
      }

      res.status(200).json({
        success: true,
        message: "Referral joined successfully",
        referral: updatedReferral,
      });
    } catch (error: any) {
      console.error("Error updating referral:", error.message);
      res.status(500).json({ error: "Failed to update referral" });
    }
  }

  async joinReferral(req: Request, res: Response) {
    try {
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

      // Extract referral_code from the request body
      const { referral_code } = req.body;

      // Validate referral_code presence
      if (!referral_code) {
        return res.status(400).json({
          success: false,
          message: "Referral code is required.",
        });
      }

      const userRepository = appDataSource.getRepository(User);

      // Find user by referral_code
      const referringUser = await userRepository.findOne({
        where: { referral_code },
      });

      if (!referringUser) {
        return res.status(404).json({
          success: false,
          message: "Invalid referral code.",
        });
      }

      // Increment the referring user's score by 1
      referringUser.score += 1;

      // Save the updated user
      await userRepository.save(referringUser);

      return res.status(200).json({
        success: true,
        message: "Referred successfully!.",
        data: {
          referringUser: {
            id: referringUser.id,
            username: referringUser.username,
            score: referringUser.score,
          },
        },
      });
    } catch (error: any) {
      console.error("Error updating referral:", error.message);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the referral.",
      });
    }
  }

  async getReferralById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const referralRepository = appDataSource.getRepository(Referral);

      // Find the referral by ID
      const referral = await referralRepository.findOne({
        where: { sender_user_id: parseInt(id) },
      });

      if (!referral) {
        return res.status(404).json({
          success: false,
          message: "Referral not found",
        });
      }

      res.status(200).json({
        success: true,
        referral_code: referral.referral_code,
        referral_link: referral.referral_link,
      });
    } catch (error: any) {
      console.error("Error fetching referral:", error.message);
      res.status(500).json({ error: "Failed to fetch referral" });
    }
  }

  async getReferralsBySender(req: Request, res: Response) {
    try {
      const { sender_user_id } = req.params;

      const referralRepository = appDataSource.getRepository(Referral);

      // Find referrals by sender_user_id
      const referrals = await referralRepository.find({
        where: { sender_user_id: parseInt(sender_user_id) },
      });

      if (referrals.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No referrals found for this user",
        });
      }

      // Extract unique receiver_user_ids from referrals
      const receiverUserIds = referrals.map((referral) => referral.receiver_id);

      // Fetch users based on receiver_user_ids from User entity, selecting only necessary fields
      const userRepository = appDataSource.getRepository(User);
      const receiverUsers = await userRepository.find({
        where: receiverUserIds.map((id) => ({ id })),
        select: ["id", "username", "email", "score"],
        relations: ["profile"],
      });

      // Attach receiver user information to each referral, filtering fields
      const referralsWithUsers = referrals.map((referral) => {
        const receiverUser = receiverUsers.find(
          (user) => user.id === referral.receiver_id
        );

        if (
          receiverUser &&
          receiverUser.profile &&
          receiverUser.profile.image
        ) {
          // Concatenate the base URL with the image field
          receiverUser.profile.image = receiverUser.profile.image
            ? `${BASE_URL}${receiverUser.profile.image}`
            : "";
        }

        return {
          ...referral,
          receiver_user: receiverUser,
        };
      });

      res.status(200).json({
        success: true,
        referrals: referralsWithUsers,
      });
    } catch (error: any) {
      console.error("Error retrieving referrals:", error.message);
      res.status(500).json({ error: "Failed to retrieve referrals" });
    }
  }

  async getTopUsersByScore(req: Request, res: Response) {
    try {
      const userRepository = appDataSource.getRepository(User);

      // Fetch top users by score in descending order
      const topUsers = await userRepository.find({
        select: ["id", "username", "email", "score", "is_deleted"],
        where: { is_deleted: false },

        order: { score: "DESC" },
        take: 10,
        relations: ["profile"], // Include the profile relation
      });

      // Process the users to add the base URL to the image path
      const processedUsers = topUsers.map((user) => {
        if (user.profile && user.profile.image) {
          user.profile.image = user.profile.image
            ? `${BASE_URL}${user.profile.image}`
            : "";
        }
        return user;
      });

      res.status(200).json({
        success: true,
        top_users: processedUsers,
      });
    } catch (error: any) {
      console.error("Error retrieving top users by score:", error.message);
      res.status(500).json({ error: "Failed to retrieve top users" });
    }
  }
}
