import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Sponsor } from "../../entities/Sponsor";
import { paginate } from "nestjs-typeorm-paginate";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class SponsorController {
  // Get all sponsors
  async getAllSponsors(req: Request, res: Response) {
    try {
      const sponsorRepository = appDataSource.getRepository(Sponsor);

      // Extract `type`, `page`, and `limit` from query parameters
      const { type, page = 1, limit = 10 } = req.query;

      // Build query builder for filtering and pagination
      let queryBuilder = sponsorRepository.createQueryBuilder("sponsor");

      if (type) {
        queryBuilder = queryBuilder.where("sponsor.type = :type", { type });
      }

      // Apply pagination
      const pagination = await paginate<Sponsor>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      // Attach BASE_URL to `url` field for each sponsor
      const updatedSponsors = pagination.items.map((sponsor) => ({
        ...sponsor,
        url: `${BASE_URL}${sponsor.url}`,
      }));

      // Send response with pagination details
      return res.status(200).json({
        message: "Sponsors retrieved successfully",
        data: updatedSponsors,
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching sponsors",
        error,
      });
    }
  }

  async getLatestSponsors(req: Request, res: Response) {
    try {
      const sponsorRepository = appDataSource.getRepository(Sponsor);

      // Extract `type` from query parameters
      const { type } = req.query;

      // Validate the type parameter
      if (!type || (type !== "image" && type !== "video")) {
        return res.status(400).json({
          message:
            "Invalid or missing type parameter. Valid values are 'image' or 'video'.",
          success: false,
        });
      }

      // Fetch the latest 8 records based on the type
      const sponsors = await sponsorRepository
        .createQueryBuilder("sponsor")
        .where("sponsor.type = :type", { type })
        .orderBy("sponsor.created_at", "DESC")
        .limit(8)
        .getMany();

      // Attach BASE_URL to `url` field for each sponsor
      const updatedSponsors = sponsors.map((sponsor) => ({
        ...sponsor,
        url: `${BASE_URL}${sponsor.url}`,
      }));

      // Send response
      return res.status(200).json({
        message: `Latest sponsors of type '${type}' retrieved successfully`,
        data: updatedSponsors,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching latest sponsors",
        error,
      });
    }
  }
}
