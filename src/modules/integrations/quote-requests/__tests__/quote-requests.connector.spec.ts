import {
  normalizeQuoteRequestItem,
  normalizeQuoteRequestList,
} from "../connectors/normalize-quote-request";
import { KfppWpConnector } from "../connectors/kfpp-wp.connector";
import {
  decryptSecret,
  encryptSecret,
  secretPrefix,
} from "../utils/integration-secrets.util";

describe("normalizeQuoteRequest", () => {
  it("maps common website inquiry fields", () => {
    const item = normalizeQuoteRequestItem({
      id: 42,
      name: "Ada Lovelace",
      email: "Ada@Example.com",
      phone: "+1",
      company: "Analytical Engines",
      message: "Need air quote",
      status: "new",
      created_at: "2026-01-02T00:00:00Z",
    });
    expect(item?.external_id).toBe("42");
    expect(item?.contact_email).toBe("ada@example.com");
    expect(item?.contact_name).toBe("Ada Lovelace");
    expect(item?.company_name).toBe("Analytical Engines");
    expect(item?.status).toBe("new");
  });

  it("parses list shape { total, items }", () => {
    const list = normalizeQuoteRequestList({
      total: 1,
      items: [{ id: "7", email: "a@b.com", name: "A" }],
    });
    expect(list.total).toBe(1);
    expect(list.items).toHaveLength(1);
    expect(list.items[0].external_id).toBe("7");
  });
});

describe("integration secrets", () => {
  it("round-trips encryption and never embeds plaintext", () => {
    const plain = "kfpp-live-secret-value";
    const cipher = encryptSecret(plain);
    expect(cipher).not.toContain(plain);
    expect(decryptSecret(cipher)).toBe(plain);
    expect(secretPrefix(plain)).toBe("kfpp-liv");
  });
});

describe("KfppWpConnector", () => {
  it("lists with header auth and normalizes empty payload", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 0, items: [] }),
    });
    const connector = new KfppWpConnector({
      baseUrl: "https://example.com/wp-json/kfpp/v1",
      apiKey: "test-key-value",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const list = await connector.list();
    expect(list.total).toBe(0);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.com/wp-json/kfpp/v1/quotes",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-KFPP-Api-Key": "test-key-value",
        }),
      }),
    );
  });

  it("rejects non-numeric ids for get/patch", async () => {
    const connector = new KfppWpConnector({
      baseUrl: "https://example.com/wp-json/kfpp/v1",
      apiKey: "test-key-value",
      fetchImpl: jest.fn() as unknown as typeof fetch,
    });
    await expect(connector.get("abc")).rejects.toThrow(/numeric/i);
  });

  it("PATCHes status", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    });
    const connector = new KfppWpConnector({
      baseUrl: "https://example.com/wp-json/kfpp/v1",
      apiKey: "secret",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await connector.updateStatus("9", "pending");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.com/wp-json/kfpp/v1/quotes/9",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "pending" }),
      }),
    );
  });

  it("treats 401 as invalid connection without echoing the key", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: "nope" }),
    });
    const connector = new KfppWpConnector({
      baseUrl: "https://example.com/wp-json/kfpp/v1",
      apiKey: "super-secret-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(connector.list()).rejects.toThrow(/rejected the API key/i);
    const health = await connector.health();
    expect(health.ok).toBe(false);
    expect(health.message).not.toContain("super-secret-key");
  });
});
