import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    stats: [
      { tag: "Time Saving", percent: "40%", info: "less manual effort", note: "Automate survey distribution and data collection" },
      { tag: "Smarter Insights", percent: "60%", info: "deeper understanding", note: "Advanced analytics with real-time reporting" },
      { tag: "Cost Efficiency", percent: "35%", info: "lower research spend", note: "Reduce operational costs with digital surveys" },
    ],
  });
});

export const getFaq = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    faq: [
      { question: "What is Eye_Patch Survey System?", answer: "A comprehensive survey management platform for creating, distributing, and analyzing surveys." },
      { question: "Is it free to use?", answer: "We offer a free tier with basic features. Premium plans are available for advanced analytics and larger surveys." },
      { question: "Can I customize survey themes?", answer: "Yes, you can customize colors, themes, and branding to match your organization's identity." },
    ],
  });
});

export const getNews = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    news: [
      { title: "New Analytics Dashboard", date: "2026-06-15", excerpt: "Enhanced analytics with real-time response tracking and improved visualization." },
      { title: "AI-Powered Insights", date: "2026-06-01", excerpt: "Introducing machine learning driven suggestions for survey optimization." },
    ],
  });
});

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ success: false, message: "Name, email, and message are required" });
    return;
  }

  // In production, send email or store in database
  res.status(200).json({ success: true, message: "Inquiry submitted successfully." });
});
