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

  test("Root endpoint serves index.html", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
  });
});
