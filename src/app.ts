import express, { Application, Request, Response } from 'express';
import path from "path";
import watchlistRoutes from "./routes/watchlistRoutes";
import { setSecureHeaders } from "./middlewares/secureHeaders";
import errorHandler from './middlewares/error';

const app: Application = express();
const PORT = process.env.PORT || 6020;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(setSecureHeaders);
app.disable("x-powered-by");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '..', '/src/views'));

// app.use(express.static(path.join(__dirname, "../public")));

app.use("/", watchlistRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
