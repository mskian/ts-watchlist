import express from "express";
import { getAllItems, addItem, getEditForm, editItem, deleteItem } from "../controllers/watchlistController";

const router = express.Router();

router.get("/", getAllItems);
router.post("/add", addItem);
router.get("/edit/:id", getEditForm);
router.post("/edit", editItem);
router.post("/delete/:id", deleteItem);

router.get("/item-updated", (req, res) => {
  res.render("success", { message: "Item updated successfully." });
});

router.get("/item-deleted", (req, res) => {
  res.render("success", { message: "Item deleted successfully." });
});

router.get("/error", (req, res) => {
  const message = req.query.message as string || "An error occurred.";
  res.render("error", { message });
});

export default router;
