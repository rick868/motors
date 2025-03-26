import express, { Request, Response, NextFunction, Express } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import http from "http";

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
    res.json = function (bodyJson) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson]);

    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      //Improved logging. Consider using a logging library for production.
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server: http.Server = await registerRoutes(app);

  app.use((err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    //Do not throw the error after sending a response.
    console.error(err); //Log the error
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 3000;
  server.listen(
    {
      port,
      host: "0.0.0.0", //Listen on all interfaces
      //remove : reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
