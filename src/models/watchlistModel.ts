import fs from "fs";
import path from "path";
import { promisify } from "util";

export interface WatchlistItem {
  id: string;
  name: string;
  completed: string;
  its: string;
  notes: string;
}

const dataPath = path.join(__dirname, "..", "data.json");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export const readData = async (): Promise<WatchlistItem[]> => {
  try {
    if (!fs.existsSync(dataPath)) {
      await writeFileAsync(dataPath, JSON.stringify([]));
    }

    const rawData = await readFileAsync(dataPath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    throw new Error(`Error reading data`);
  }
};

export const writeData = async (data: WatchlistItem[]): Promise<void> => {
  try {
    await writeFileAsync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Error writing data`);
  }
};

export const checkDuplicate = async (name: string): Promise<boolean> => {
  try {
    const data = await readData();
    return data.some((item) => item.name.toLowerCase() === name.toLowerCase());
  } catch (error) {
    throw new Error(`Error checking for duplicates`);
  }
};

export const safeWriteFile = async (data: WatchlistItem[]): Promise<void> => {
  try {
    await writeData(data);
  } catch (error) {
    throw new Error(`Error writing file safely}`);
  }
};