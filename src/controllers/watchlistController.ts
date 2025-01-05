import { Request, Response } from "express";
import { WatchlistItem, readData, writeData, checkDuplicate } from "../models/watchlistModel";
import sanitizeHtml from "sanitize-html";

const ITEMS_PER_PAGE = 5;

export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    const data = await readData();

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedItems = data.slice(startIndex, endIndex);

    res.render("index", {
      items: paginatedItems,
      currentPage: page,
      totalPages: totalPages,
      errorMessage: req.query.error,
      successMessage: req.query.success
    });
  } catch (error) {
    res.redirect("/error?message=Failed to load items. Please try again later.");
  }
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  let { name, completed, notes } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "" || name.length > 50) {
    res.redirect("/error?message=Name is required, must be a non-empty string, and under 50 characters.");
    return;
  }

  try {
    if (await checkDuplicate(name)) {
      res.redirect("/error?message=This movie/series already exists.");
      return;
    }

    if (!completed || (completed !== "completed" && completed !== "not-completed")) {
      res.redirect("/error?message=Completion status must be either 'completed' or 'not-completed'.");
      return;
    }

    notes = notes ? notes.trim() : "";
    if (notes && notes.length > 500) {
      res.redirect("/error?message=Notes should be under 500 characters.");
      return;
    }

    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      name: sanitizeHtml(name),
      completed,
      notes: sanitizeHtml(notes || ""),
    };

    const data = await readData();
    data.push(newItem);
    await writeData(data);

    res.redirect("/item-updated");
  } catch (error) {
    res.redirect("/error?message=Failed to add item. Please try again.");
  }
};

export const getEditForm = async (req: Request, res: Response): Promise<void> => {
  const itemId = req.params.id;
  try {
    const data = await readData();
    const item = data.find((item) => item.id === itemId);

    if (!item) {
      res.redirect("/error?message=Item not found.");
      return;
    }

    res.render("edit", { item });
  } catch (error) {
    res.redirect("/error?message=Failed to load item for editing.");
  }
};

export const editItem = async (req: Request, res: Response): Promise<void> => {
  const { id, name, completed, notes } = req.body;

  if (!id || !name || typeof name !== "string" || name.trim() === "" || name.length > 50) {
    res.redirect("/error?message=Name is required, must be a non-empty string, and under 50 characters.");
    return;
  }

  try {
    if (!completed || (completed !== "completed" && completed !== "not-completed")) {
      res.redirect("/error?message=Completion status must be either 'completed' or 'not-completed'.");
      return;
    }

    const data = await readData();
    const item = data.find((item) => item.id === id);

    if (!item) {
      res.redirect("/error?message=Item not found.");
      return;
    }

    item.name = sanitizeHtml(name);
    item.completed = completed;
    item.notes = sanitizeHtml(notes || "");

    await writeData(data);
    res.redirect("/item-updated");
  } catch (error) {
    res.redirect("/error?message=Failed to update item. Please try again.");
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const data = await readData();
    const updatedData = data.filter((item) => item.id !== id);

    if (updatedData.length === data.length) {
      res.redirect("/error?message=Item not found.");
      return;
    }

    await writeData(updatedData);
    res.redirect("/item-deleted");
  } catch (error) {
    res.redirect("/error?message=Failed to delete item. Please try again.");
  }
};