import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { dashboardRouter } from "./routes/dashboard";
import { patientRouter } from "./routes/patients";
import { reportRouter } from "./routes/reports";
import { woundRouter } from "./routes/wounds";
import { validateProductionSecurity } from "./services/security";

dotenv.config();
validateProductionSecurity();

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = process.env.APP_BASE_URL
  ? process.env.APP_BASE_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : true;

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", ...(process.env.APP_BASE_URL ? process.env.APP_BASE_URL.split(",").map((origin) => origin.trim()) : [])],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  referrerPolicy: { policy: "no-referrer" },
  crossOriginResourcePolicy: { policy: "same-origin" }
}));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use((request, response, next) => {
  if (request.path === "/" || request.path.endsWith(".html")) {
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");
  }
  next();
});
app.use(express.static("public", {
  etag: false,
  setHeaders: (response, path) => {
    if (path.endsWith(".html")) {
      response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    }
  }
}));

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "spotit-api" });
});

app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/patients", patientRouter);
app.use("/wounds", woundRouter);
app.use("/reports", reportRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`Spotit API listening on port ${port}`);
});
