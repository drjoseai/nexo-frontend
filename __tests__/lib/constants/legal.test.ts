import { LEGAL_LAST_UPDATED, COMPANY_INFO } from "@/lib/constants/legal";

describe("Legal Constants", () => {
  it("exports LEGAL_LAST_UPDATED as a non-empty string", () => {
    expect(typeof LEGAL_LAST_UPDATED).toBe("string");
    expect(LEGAL_LAST_UPDATED.length).toBeGreaterThan(0);
  });

  it("exports COMPANY_INFO with required fields", () => {
    expect(COMPANY_INFO).toBeDefined();
    expect(COMPANY_INFO.name).toBe("VENKO AI INNOVATIONS LLC");
    expect(COMPANY_INFO.email).toBe("info@trynexo.ai");
    expect(COMPANY_INFO.privacyEmail).toBe("privacy@trynexo.ai");
    expect(COMPANY_INFO.website).toBe("https://trynexo.ai");
    expect(COMPANY_INFO.address).toBeTruthy();
    expect(COMPANY_INFO.city).toBeTruthy();
    expect(COMPANY_INFO.country).toBe("United States");
  });
});
