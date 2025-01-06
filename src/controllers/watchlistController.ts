import { Request, Response } from "express";
import { WatchlistItem, readData, writeData, checkDuplicate } from "../models/watchlistModel";
import slugify from "slugify";
import sanitizeHtml from "sanitize-html";

const ITEMS_PER_PAGE = 5;

const redirectWithError = (res: Response, message: string): void => {
  const safeMessage = slugify(message, { lower: true, strict: true });
  res.redirect(`/error?message=${safeMessage}`);
};

export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    const data = await readData();

    const sortedData = data.sort((a, b) => {
      return parseInt(b.id) - parseInt(a.id);
    });

    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedItems = sortedData.slice(startIndex, endIndex);

    res.render("index", {
      items: paginatedItems,
      currentPage: page,
      totalPages: totalPages,
      errorMessage: req.query.error,
      successMessage: req.query.success,
    });
  } catch (error) {
    redirectWithError(res, "Failed to load items. Please try again later.");
  }
};

export const AllItems = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    const data = await readData();

    const sortedData = data.sort((a, b) => {
      return parseInt(b.id) - parseInt(a.id);
    });

    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedItems = sortedData.slice(startIndex, endIndex);

    res.render("watchlist", {
      items: paginatedItems,
      currentPage: page,
      totalPages: totalPages,
      errorMessage: req.query.error,
      successMessage: req.query.success,
    });
  } catch (error) {
    redirectWithError(res, "Failed to load items. Please try again later.");
  }
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  let { name, completed, its, notes,} = req.body;

  if (!name || typeof name !== "string" || name.trim() === "" || name.length > 50) {
    redirectWithError(res, "Name is required, must be a non-empty string, and under 50 characters.");
    return;
  }

  try {
    if (await checkDuplicate(name)) {
      redirectWithError(res, "This movie/series already exists.");
      return;
    }

    if (!completed || (completed !== "completed" && completed !== "not-completed")) {
      redirectWithError(res, "Completion status must be either 'completed' or 'not-completed'.");
      return;
    }

    if (!its || (its !== "movie" && its !== "tv-show")) {
      redirectWithError(res, "Choose one 'Movie' or 'TV Show'.");
      return;
    }

    completed === "true" ? "completed" : "not-completed";

    notes = notes ? notes.trim() : "";
    if (notes && notes.length > 500) {
      redirectWithError(res, "Notes should be under 500 characters.");
      return;
    }

    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      name: sanitizeHtml(name),
      completed,
      its,
      notes: sanitizeHtml(notes || ""),
    };

    const data = await readData();
    data.push(newItem);
    await writeData(data);

    res.redirect("/item-updated");
  } catch (error) {
    redirectWithError(res, "Failed to add item. Please try again.");
  }
};

export const getEditForm = async (req: Request, res: Response): Promise<void> => {
  const itemId = req.params.id;
  try {
    const data = await readData();
    const item = data.find((item) => item.id === itemId);

    if (!item) {
      redirectWithError(res, "Item not found.");
      return;
    }

    res.render("edit", { item });
  } catch (error) {
    redirectWithError(res, "Failed to load item for editing.");
  }
};

export const editItem = async (req: Request, res: Response): Promise<void> => {
  const { id, name, completed, its, notes } = req.body;

  if (!id || !name || typeof name !== "string" || name.trim() === "" || name.length > 50) {
    redirectWithError(res, "Name is required, must be a non-empty string, and under 50 characters.");
    return;
  }

  try {
    if (!completed || (completed !== "completed" && completed !== "not-completed")) {
      redirectWithError(res, "Completion status must be either 'completed' or 'not-completed'.");
      return;
    }

    if (!its || (its !== "movie" && its !== "tv-show")) {
      redirectWithError(res, "Choose one 'movie' or 'tv-show'.");
      return;
    }

    completed === "true" ? "completed" : "not-completed";

    const data = await readData();
    const item = data.find((item) => item.id === id);

    if (!item) {
      redirectWithError(res, "Item not found.");
      return;
    }

    item.name = sanitizeHtml(name);
    item.completed = completed;
    item.its = its;
    item.notes = sanitizeHtml(notes || "");

    await writeData(data);
    res.redirect("/item-updated");
  } catch (error) {
    redirectWithError(res, "Failed to update item. Please try again.");
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const data = await readData();
    const updatedData = data.filter((item) => item.id !== id);

    if (updatedData.length === data.length) {
      redirectWithError(res, "Item not found.");
      return;
    }

    await writeData(updatedData);
    res.redirect("/item-deleted");
  } catch (error) {
    redirectWithError(res, "Failed to delete item. Please try again.");
  }
};

export const toggleCompletion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const data = await readData();
    const item = data.find((item) => item.id === id);

    if (!item) {
      redirectWithError(res, "message=Item not found.");
      return;
    }

    item.completed = item.completed === "completed" ? "not-completed" : "completed";

    await writeData(data);
    res.redirect("/item-updated");
  } catch (error) {
    redirectWithError(res, "Failed to toggle completion status. Please try again.");
  }
};