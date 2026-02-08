import { isAvatarAvailableForPlan, isRelationshipAvailable } from "@/types/avatar";

describe("Avatar Plan Access", () => {
  describe("isAvatarAvailableForPlan", () => {
    it("trial users can access all three avatars", () => {
      expect(isAvatarAvailableForPlan("lia", "trial")).toBe(true);
      expect(isAvatarAvailableForPlan("mia", "trial")).toBe(true);
      expect(isAvatarAvailableForPlan("allan", "trial")).toBe(true);
    });

    it("free users can only access lia", () => {
      expect(isAvatarAvailableForPlan("lia", "free")).toBe(true);
      expect(isAvatarAvailableForPlan("mia", "free")).toBe(false);
      expect(isAvatarAvailableForPlan("allan", "free")).toBe(false);
    });

    it("plus users can access all avatars", () => {
      expect(isAvatarAvailableForPlan("lia", "plus")).toBe(true);
      expect(isAvatarAvailableForPlan("mia", "plus")).toBe(true);
      expect(isAvatarAvailableForPlan("allan", "plus")).toBe(true);
    });

    it("premium users can access all avatars", () => {
      expect(isAvatarAvailableForPlan("lia", "premium")).toBe(true);
      expect(isAvatarAvailableForPlan("mia", "premium")).toBe(true);
      expect(isAvatarAvailableForPlan("allan", "premium")).toBe(true);
    });
  });

  describe("isRelationshipAvailable", () => {
    it("trial users can access assistant and friend", () => {
      expect(isRelationshipAvailable("assistant", "trial")).toBe(true);
      expect(isRelationshipAvailable("friend", "trial")).toBe(true);
    });

    it("trial users cannot access confidant or romantic", () => {
      expect(isRelationshipAvailable("confidant", "trial")).toBe(false);
      expect(isRelationshipAvailable("romantic", "trial")).toBe(false);
    });
  });
});
