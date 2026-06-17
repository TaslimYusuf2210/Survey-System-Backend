import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as searchService from "../services/search.service.js";

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query["q"] as string;
  if (!query) {
    res.status(400).json({ success: false, message: "Search query 'q' is required" });
    return;
  }

  const type = (req.query["type"] as string) || "all";
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query["limit"]) || 10));

  const results = await searchService.globalSearch(req.userId!, query, type, page, limit);
  res.status(200).json(results);
});
