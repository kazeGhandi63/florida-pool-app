import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-cb3c6f7a/health", (c) => {
  return c.json({ status: "ok" });
});

// Get daily readings
app.get("/make-server-cb3c6f7a/daily-readings", async (c) => {
  try {
    const data = await kv.get("pool-daily-readings");
    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching daily readings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save daily readings
app.post("/make-server-cb3c6f7a/daily-readings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("pool-daily-readings", body.data);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving daily readings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get weekly readings
app.get("/make-server-cb3c6f7a/weekly-readings", async (c) => {
  try {
    const sundayData = await kv.get("pool-weekly-readings-sunday");
    const wednesdayData = await kv.get("pool-weekly-readings-wednesday");
    return c.json({ 
      success: true, 
      data: {
        sunday: sundayData || [],
        wednesday: wednesdayData || []
      }
    });
  } catch (error) {
    console.error("Error fetching weekly readings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save weekly readings
app.post("/make-server-cb3c6f7a/weekly-readings", async (c) => {
  try {
    const body = await c.req.json();
    if (body.sunday) {
      await kv.set("pool-weekly-readings-sunday", body.sunday);
    }
    if (body.wednesday) {
      await kv.set("pool-weekly-readings-wednesday", body.wednesday);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving weekly readings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);