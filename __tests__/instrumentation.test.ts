import { register } from "../instrumentation";

describe("instrumentation", () => {
  it("should export register function", () => {
    expect(typeof register).toBe("function");
  });

  it("register should execute without errors", async () => {
    // In test environment, NEXT_RUNTIME is not set, so neither import runs
    await expect(register()).resolves.not.toThrow();
  });
});
