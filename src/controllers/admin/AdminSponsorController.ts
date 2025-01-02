import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Sponsor } from "../../entities/Sponsor";
import { validationResult } from "express-validator";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class AdminSponsorController {
  // Create a new sponsor
  async createSponsor(req: Request, res: Response) {
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

      const reqs = req.body;
      console.log("🚀 ~ AdminSponsorController ~ createSponsor ~ reqs:", reqs);

      const reqi = (req as any).file;
      console.log("🚀 ~ AdminSponsorController ~ createSponsor ~ reqi:", reqi);

      const { title, type, sponsor_link } = req.body;

      const url = (req as any).file?.path.replace(/\\/g, "/");
      console.log("🚀 ~ AdminSponsorController ~ createSponsor ~ url:", url);

      //   // Check if URL is missing
      //   if (!url) {
      //     return res.status(400).json({
      //       success: false,
      //       message: "The sponsor must include a valid URL for the content.",
      //       errors: { url: ["URL is required"] },
      //     });
      //   }

      const sponsorRepository = appDataSource.getRepository(Sponsor);

      const newSponsor = sponsorRepository.create({
        title,
        type,
        url,
        sponsor_link,
      });

      const savedSponsor = await sponsorRepository.save(newSponsor);

      return res.status(201).json({
        message: "Sponsor created successfully",
        data: savedSponsor,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error creating sponsor", error });
    }
  }

  // Get all sponsors
  async getAllSponsors(req: Request, res: Response) {
    try {
      const sponsorRepository = appDataSource.getRepository(Sponsor);

      // Extract `type` from query parameters
      const { type } = req.query;

      // Build query options
      const queryOptions: any = {};
      if (type) {
        queryOptions.type = type;
      }

      // Fetch sponsors based on the query
      const sponsors = await sponsorRepository.find({
        where: queryOptions,
      });

      // Concatenate BASE_URL with the `url` field

      const updatedSponsors = sponsors.map((sponsor) => ({
        ...sponsor,
        url: `${BASE_URL}${sponsor.url}`,
      }));

      return res.status(200).json({
        message: "Sponsors retrieved successfully",
        data: updatedSponsors,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching sponsors", error });
    }
  }

  // Get a single sponsor by ID
  async getSponsorById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sponsorRepository = appDataSource.getRepository(Sponsor);

      const sponsor = await sponsorRepository.findOne({
        where: { id: Number(id) },
      });

      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      sponsor.url = `${BASE_URL}${sponsor.url}`;

      return res.status(200).json({
        message: "Sponsor retrieved successfully",
        data: sponsor,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching sponsor", error });
    }
  }

  // Update a sponsor by ID
  async updateSponsor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, type, url, sponsor_link, active } = req.body;

      const sponsorRepository = appDataSource.getRepository(Sponsor);

      const sponsor = await sponsorRepository.findOne({
        where: { id: Number(id) },
      });

      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      sponsor.title = title || sponsor.title;
      sponsor.type = type || sponsor.type;
      sponsor.url = url || sponsor.url;
      sponsor.sponsor_link = sponsor_link || sponsor.sponsor_link;
      sponsor.active = active || sponsor.active;

      const updatedSponsor = await sponsorRepository.save(sponsor);

      return res.status(200).json({
        message: "Sponsor updated successfully",
        data: updatedSponsor,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error updating sponsor", error });
    }
  }

  // Delete a sponsor by ID
  async deleteSponsor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sponsorRepository = appDataSource.getRepository(Sponsor);

      const sponsor = await sponsorRepository.findOne({
        where: { id: Number(id) },
      });

      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      await sponsorRepository.remove(sponsor);

      return res.status(200).json({
        message: "Sponsor deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting sponsor", error });
    }
  }
}
