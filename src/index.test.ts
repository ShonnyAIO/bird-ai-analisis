import { expect, test, describe } from "bun:test";
import app from "./index";

describe("AI Proxy API", () => {
  test("Status endpoint returns ok", async () => {
    const response = await app.handle(new Request("http://localhost/status"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("ok");
  });

  test("Swagger documentation is available", async () => {
    const response = await app.handle(new Request("http://localhost/swagger"));
    expect(response.status).toBe(200);
  });

  test("Root endpoint serves a response", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);
  });

  test("Chat endpoint accepts vision message structure", async () => {
    const response = await app.handle(new Request("http://localhost/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Hello" },
              { type: "image_url", image_url: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" } }
            ]
          }
        ]
      })
    }));
    // We expect a 200 OK because the proxy should try to route it. 
    // Even if it fails downstream without a real API key, the Elysia validation should pass.
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
  });
});
