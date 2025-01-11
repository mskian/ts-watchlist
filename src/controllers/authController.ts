import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import slugify from "slugify";
import sanitizeHtml from "sanitize-html";
import dotenv from "dotenv";
dotenv.config();

const VALID_KEY = process.env.AUTH_KEY || "123456";

const redirectWithError = (res: Response, message: string): void => {
  const safeMessage = slugify(message, { lower: true, strict: true });
  res.redirect(`/key?error=${safeMessage}`);
};
  
export const keyRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    return redirectWithError(res, "Too many attempts. Please try again after 30 minutes.");
  }
});

const decodeSlug = (slug: string): string => {
    return slug.replace(/-/g, " ");
  };
  
export const renderKeyPage = (req: Request, res: Response): void => {
    const getMessage = typeof req.query.error === 'string' ? req.query.error : '';
    const cleanMessage = sanitizeHtml(getMessage);
    const errordata = decodeSlug(cleanMessage);
    if (req.cookies.auth_key) {
      return res.redirect('/');
    }
    res.render("key", { errordata });
};

export const validateKey = (req: Request, res: Response): void => {
  try {
    const { key } = req.body;

    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return redirectWithError(res, "Key is required.");
    }

    if (key !== VALID_KEY) {
      return redirectWithError(res, "Invalid key. Please try again.");
    }

    res.cookie("auth_key", VALID_KEY, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (error) {
    redirectWithError(res, "An unexpected error occurred. Please try again.");
  }
};

export const logout = (req: Request, res: Response): void => {
  try {
    res.clearCookie("auth_key", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    redirectWithError(res, "You have been logged out.");
  } catch (error) {
    redirectWithError(res, "An unexpected error occurred during logout.");
  }
};
