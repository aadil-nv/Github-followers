import cors from "cors";
import { config } from "./env";

// Use a single origin from env
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin || origin === config.CORS_ORIGINS[0]) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies or authorization headers
};
