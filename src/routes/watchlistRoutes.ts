import express, { Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import { getAllItems, AllItems, addItem, getEditForm, editItem, deleteItem, toggleCompletion } from "../controllers/watchlistController";

const router = express.Router();

const decodeSlug = (slug: string): string => {
  return slug.replace(/-/g, " ");
};

router.get("/", getAllItems);
router.get("/watchlist", AllItems);
router.post("/add", addItem);
router.get("/edit/:id", getEditForm);
router.post("/edit", editItem);
router.post("/delete/:id", deleteItem);
router.post("/toggle/:id", toggleCompletion); 

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
