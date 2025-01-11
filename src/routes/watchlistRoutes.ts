import express, { Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import {
  renderKeyPage,
  validateKey,
  logout,
  keyRateLimiter
} from "../controllers/authController";
import { isAuthorized } from "../middlewares/keyMiddleware";
import { getAllItems, AllItems, addItem, getEditForm, editItem, deleteItem, toggleCompletion } from "../controllers/watchlistController";

const router = express.Router();

const decodeSlug = (slug: string): string => {
  return slug.replace(/-/g, " ");
};

router.get("/key", renderKeyPage);
router.post("/key", keyRateLimiter, validateKey);
router.get("/logout", logout);

router.get("/", isAuthorized, AllItems);
router.get("/dashboard", isAuthorized, getAllItems);
router.post("/add", isAuthorized, addItem);
router.get("/edit/:id", isAuthorized, getEditForm);
router.post("/edit", isAuthorized, editItem);
router.post("/delete/:id", isAuthorized, deleteItem);
router.post("/toggle/:id", isAuthorized, toggleCompletion);

router.get("/item-updated", (req, res) => {
  res.render("success", { message: "Item updated successfully." });
});

router.get("/item-deleted", (req, res) => {
  res.render("success", { message: "Item deleted successfully." });
});

router.get("/error", (req: Request, res: Response) => {
  const slug = req.query.message as string;
  const decodedMessage = decodeSlug(slug) || "An unknown error occurred.";
  res.render("error", { message: sanitizeHtml(decodedMessage) });
});

export default router;
