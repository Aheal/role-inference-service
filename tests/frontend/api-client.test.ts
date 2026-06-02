import { afterEach, describe, expect, it, vi } from "vitest";
import { resetMapping } from "../../frontend/src/api.js";

describe("frontend API client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not send a JSON content-type for bodyless reset requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ source: "inferred" })
    } as Response);

    await resetMapping("usr_007");

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeUndefined();
    expect(headers.has("Content-Type")).toBe(false);
  });
});
