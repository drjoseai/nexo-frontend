jest.mock("@/components/chat/ChatInterface", () => ({ ChatInterface: {} }));
jest.mock("@/components/chat/ChatInterfaceLazy", () => ({ ChatInterfaceLazy: {} }));
jest.mock("@/components/chat/ChatInput", () => ({ ChatInput: {} }));
jest.mock("@/components/chat/MessageBubble", () => ({ MessageBubble: {} }));
jest.mock("@/components/chat/RelationshipTypeSelector", () => ({ RelationshipTypeSelector: {} }));
jest.mock("@/components/chat/DeleteHistoryButton", () => ({ DeleteHistoryButton: {} }));
jest.mock("@/components/chat/EmojiPickerButton", () => ({ EmojiPickerButton: {} }));
jest.mock("@/components/chat/FileAttachmentButton", () => ({ FileAttachmentButton: {} }));
jest.mock("@/components/chat/FilePreview", () => ({ FilePreview: {} }));
jest.mock("@/components/chat/MessageAttachment", () => ({ MessageAttachment: {} }));
jest.mock("@/components/chat/ImageLightbox", () => ({ ImageLightbox: {} }));

jest.mock("@/components/profile/ProfileContent", () => ({ ProfileContent: {} }));
jest.mock("@/components/profile/ProfilePageLazy", () => ({ ProfilePageLazy: {}, ProfileSkeleton: {} }));

jest.mock("@/components/pwa/install-prompt", () => ({ PWAInstallPrompt: {} }));
jest.mock("@/components/pwa/PWAUpdateNotification", () => ({ PWAUpdateNotification: {} }));

jest.mock("@/components/settings/SettingsContent", () => ({ SettingsContent: {} }));
jest.mock("@/components/settings/SettingsPageLazy", () => ({ SettingsPageLazy: {}, SettingsSkeleton: {} }));

jest.mock("@/components/subscription/SubscriptionContent", () => ({ SubscriptionContent: {} }));
jest.mock("@/components/subscription/SubscriptionPageLazy", () => ({ SubscriptionPageLazy: {}, SubscriptionSkeleton: {} }));

describe("Barrel exports", () => {
  it("components/chat/index.ts re-exports all chat components", () => {
    const chatExports = require("@/components/chat");
    expect(chatExports.ChatInterface).toBeDefined();
    expect(chatExports.ChatInterfaceLazy).toBeDefined();
    expect(chatExports.ChatInput).toBeDefined();
    expect(chatExports.MessageBubble).toBeDefined();
    expect(chatExports.RelationshipTypeSelector).toBeDefined();
    expect(chatExports.DeleteHistoryButton).toBeDefined();
    expect(chatExports.EmojiPickerButton).toBeDefined();
    expect(chatExports.FileAttachmentButton).toBeDefined();
    expect(chatExports.FilePreview).toBeDefined();
    expect(chatExports.MessageAttachment).toBeDefined();
    expect(chatExports.ImageLightbox).toBeDefined();
  });

  it("components/profile/index.ts re-exports profile components", () => {
    const profileExports = require("@/components/profile");
    expect(profileExports.ProfileContent).toBeDefined();
    expect(profileExports.ProfilePageLazy).toBeDefined();
    expect(profileExports.ProfileSkeleton).toBeDefined();
  });

  it("components/pwa/index.ts re-exports pwa components", () => {
    const pwaExports = require("@/components/pwa");
    expect(pwaExports.PWAInstallPrompt).toBeDefined();
    expect(pwaExports.PWAUpdateNotification).toBeDefined();
  });

  it("components/settings/index.ts re-exports settings components", () => {
    const settingsExports = require("@/components/settings");
    expect(settingsExports.SettingsContent).toBeDefined();
    expect(settingsExports.SettingsPageLazy).toBeDefined();
    expect(settingsExports.SettingsSkeleton).toBeDefined();
  });

  it("components/subscription/index.ts re-exports subscription components", () => {
    const subscriptionExports = require("@/components/subscription");
    expect(subscriptionExports.SubscriptionContent).toBeDefined();
    expect(subscriptionExports.SubscriptionPageLazy).toBeDefined();
    expect(subscriptionExports.SubscriptionSkeleton).toBeDefined();
  });
});
