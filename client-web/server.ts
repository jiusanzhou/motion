import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface Session {
  browser?: WebSocket;
  agents: Set<WebSocket>;
}

const sessions = new Map<string, Session>();

function getOrCreateSession(sessionId: string): Session {
  let session = sessions.get(sessionId);
  if (!session) {
    session = { agents: new Set() };
    sessions.set(sessionId, session);
  }
  return session;
}

function cleanupSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return;
  if (!session.browser && session.agents.size === 0) {
    sessions.delete(sessionId);
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const { pathname, query } = parse(req.url!, true);

    if (pathname !== "/api/relay") {
      // Let Next.js handle its own WebSocket upgrades (HMR)
      if (pathname?.startsWith("/_next/")) {
        return;
      }
      socket.destroy();
      return;
    }

    const role = query.role as string | undefined;
    const sessionId = query.sessionId as string | undefined;

    if (!role || !sessionId || !["browser", "agent"].includes(role)) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, { role, sessionId });
    });
  });

  wss.on(
    "connection",
    (ws: WebSocket, _req, meta: { role: string; sessionId: string }) => {
      const { role, sessionId } = meta;
      const session = getOrCreateSession(sessionId);

      if (role === "browser") {
        // If there's already a browser, close the old one
        if (session.browser && session.browser.readyState === WebSocket.OPEN) {
          session.browser.close(1000, "Replaced by new browser connection");
        }
        session.browser = ws;

        // Notify connected agents that browser is available
        for (const agent of session.agents) {
          if (agent.readyState === WebSocket.OPEN) {
            agent.send(
              JSON.stringify({ type: "status", status: "browser_connected" })
            );
          }
        }
      } else {
        session.agents.add(ws);

        // Notify browser about new agent
        if (
          session.browser &&
          session.browser.readyState === WebSocket.OPEN
        ) {
          session.browser.send(
            JSON.stringify({
              type: "status",
              status: "agent_connected",
              agentCount: session.agents.size,
            })
          );
        }
      }

      // ── Heartbeat ──
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30_000);

      let alive = true;
      ws.on("pong", () => {
        alive = true;
      });

      const healthCheck = setInterval(() => {
        if (!alive) {
          ws.terminate();
          return;
        }
        alive = false;
      }, 60_000);

      // ── Message relay ──
      ws.on("message", (data) => {
        const raw = typeof data === "string" ? data : data.toString();

        if (role === "agent") {
          // Forward agent request → browser
          if (
            session.browser &&
            session.browser.readyState === WebSocket.OPEN
          ) {
            session.browser.send(raw);
          } else {
            // No browser connected – send error back
            try {
              const parsed = JSON.parse(raw);
              if (parsed.type === "request" && parsed.payload?.id) {
                ws.send(
                  JSON.stringify({
                    type: "response",
                    payload: {
                      id: parsed.payload.id,
                      error: { code: -1, message: "No browser connected" },
                    },
                  })
                );
              }
            } catch {
              // Ignore unparseable messages
            }
          }
        } else {
          // Forward browser response → all agents (agent will match by id)
          for (const agent of session.agents) {
            if (agent.readyState === WebSocket.OPEN) {
              agent.send(raw);
            }
          }
        }
      });

      // ── Disconnect cleanup ──
      ws.on("close", () => {
        clearInterval(pingInterval);
        clearInterval(healthCheck);

        if (role === "browser") {
          if (session.browser === ws) {
            session.browser = undefined;
            // Notify agents
            for (const agent of session.agents) {
              if (agent.readyState === WebSocket.OPEN) {
                agent.send(
                  JSON.stringify({
                    type: "status",
                    status: "browser_disconnected",
                  })
                );
              }
            }
          }
        } else {
          session.agents.delete(ws);
          // Notify browser
          if (
            session.browser &&
            session.browser.readyState === WebSocket.OPEN
          ) {
            session.browser.send(
              JSON.stringify({
                type: "status",
                status: "agent_disconnected",
                agentCount: session.agents.size,
              })
            );
          }
        }

        cleanupSession(sessionId);
      });

      ws.on("error", () => {
        ws.terminate();
      });
    }
  );

  server.listen(port, () => {
    console.log(
      `> Motion server ready on http://${hostname}:${port} (${dev ? "dev" : "production"})`
    );
  });
});
