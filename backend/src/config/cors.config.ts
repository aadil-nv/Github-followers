import cors from "cors";
import { config } from "./env";

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman) or matching the single allowed origin
    if (!origin || origin === config.CORS_ORIGINS) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // allow preflight
  allowedHeaders: ["Content-Type", "Authorization"], // headers your frontend sends
};
