import cors, { CorsOptions } from "cors";
import { config } from "./env";

console.log("Allowed CORS Origins:", config.CORS_ORIGINS);

export const corsOptions: CorsOptions = {
  origin: config.CORS_ORIGINS, // Default to localhost if not set
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

