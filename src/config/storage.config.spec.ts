import { resolveStorageSettings } from "./storage.config";

describe("resolveStorageSettings (R2)", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("selects r2 when STORAGE_PROVIDER=r2 and all R2 vars are set", () => {
    process.env.STORAGE_PROVIDER = "r2";
    process.env.R2_ACCOUNT_ID = "abc123accountid";
    process.env.R2_ACCESS_KEY_ID = "key";
    process.env.R2_SECRET_ACCESS_KEY = "secret";
    process.env.R2_BUCKET = "kingfisher-files";
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.STORAGE_ACCESS_KEY_ID;

    const s = resolveStorageSettings();
    expect(s.provider).toBe("r2");
    expect(s.useObjectStorage).toBe(true);
    expect(s.endpoint).toBe(
      "https://abc123accountid.r2.cloudflarestorage.com",
    );
    expect(s.forcePathStyle).toBe(true);
    expect(s.serverSideEncryption).toBe(false);
    expect(s.missingEnv).toEqual([]);
  });

  it("falls back to local and lists missing env when R2 incomplete", () => {
    process.env.STORAGE_PROVIDER = "r2";
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_BUCKET;
    delete process.env.STORAGE_S3_ENDPOINT;

    const s = resolveStorageSettings();
    expect(s.provider).toBe("local");
    expect(s.useObjectStorage).toBe(false);
    expect(s.requestedProvider).toBe("r2");
    expect(s.missingEnv).toEqual(
      expect.arrayContaining([
        "R2_ACCOUNT_ID",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_BUCKET",
      ]),
    );
  });

  it("defaults to local for development", () => {
    process.env.STORAGE_PROVIDER = "local";
    delete process.env.R2_ACCOUNT_ID;
    const s = resolveStorageSettings();
    expect(s.provider).toBe("local");
    expect(s.useObjectStorage).toBe(false);
  });
});
