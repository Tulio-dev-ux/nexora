import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketServer } from "socket.io";
import { createRedisClient, isRedisConfigured } from "../src/lib/redis";
import { prisma } from "../src/lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface LiveEvent {
  type: string;
  message: string;
  severity: "info" | "warning" | "success" | "danger";
  timestamp: string;
}

async function loadMetrics() {
  try {
    const m = await prisma.liveMetric.findUnique({ where: { id: "global" } });
    if (m) {
      return {
        onlineUsers: m.onlineUsers,
        requestsPerMin: m.requestsPerMin,
        eventsProcessed: m.eventsProcessed,
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // DB optional during boot
  }
  return {
    onlineUsers: 2847 + Math.floor(Math.random() * 100),
    requestsPerMin: 12000 + Math.floor(Math.random() * 1000),
    eventsProcessed: 892 + Math.floor(Math.random() * 20),
    timestamp: new Date().toISOString(),
  };
}

function randomEvent(): LiveEvent {
  const events = [
    { type: "moderation", message: "AI moderated spam message", severity: "success" as const },
    { type: "raid", message: "Raid attempt blocked", severity: "warning" as const },
    { type: "ticket", message: "Auto-response sent to ticket", severity: "info" as const },
    { type: "member", message: "New member joined via welcome flow", severity: "info" as const },
    { type: "security", message: "Malicious link detected and removed", severity: "danger" as const },
  ];
  const e = events[Math.floor(Math.random() * events.length)];
  return { ...e, timestamp: new Date().toISOString() };
}

app.prepare().then(() => {
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const parsedUrl = parse(req.url ?? "", true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Request error:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }
  );

  const io = new SocketServer(httpServer, {
    path: "/api/socket",
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL ?? "*", methods: ["GET", "POST"] },
  });

  io.on("connection", async (socket) => {
    socket.emit("metrics:update", await loadMetrics());
    socket.on("subscribe", (room: string) => socket.join(room));
  });

  setInterval(async () => {
    io.emit("metrics:update", await loadMetrics());
  }, 3000);

  setInterval(() => {
    io.emit("event:new", randomEvent());
  }, 8000);

  const redis = createRedisClient();
  if (redis && isRedisConfigured()) {
    const subscriber = redis.duplicate();
    subscriber.subscribe(
      "moderation:action",
      "member:join",
      "message:new",
      "server:update",
      "ticket:new",
      (err) => {
        if (err) console.error("Redis subscribe error:", err);
        else console.log("Redis pub/sub connected");
      }
    );

    subscriber.on("message", (channel, message) => {
      try {
        const payload = JSON.parse(message);
        io.emit("event:new", {
          type: channel,
          message: typeof payload === "string" ? payload : JSON.stringify(payload),
          severity: channel.includes("moderation") ? "warning" : "info",
          timestamp: new Date().toISOString(),
        });
      } catch {
        // ignore malformed messages
      }
    });
  }

  httpServer.listen(port, () => {
    console.log(`> NEXORA AI ready on http://${hostname}:${port}`);
  });
});
