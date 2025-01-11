import { Request, Response, NextFunction } from "express";
import slugify from "slugify";
import dotenv from "dotenv";
dotenv.config();

const VALID_KEY = process.env.AUTH_KEY || "123456";

const redirectWithError = (res: Response, message: string): void => {
  const safeMessage = slugify(message, { lower: true, strict: true });
  res.redirect(`/key?error=${safeMessage}`);
};

export const isAuthorized = (req: Request, res: Response, next: NextFunction): void => {
  const authKey = req.cookies?.auth_key;
  if (authKey && authKey === VALID_KEY) {
    return next();
  }
  return redirectWithError(res, "Unauthorized. Please enter a key to access.");
};