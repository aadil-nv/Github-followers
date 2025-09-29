import cors from "cors";
import { config } from "./env";

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // allow preflight
  allowedHeaders: ["Content-Type", "Authorization"], // headers your frontend sends
};
