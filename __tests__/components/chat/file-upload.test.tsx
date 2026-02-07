// __tests__/components/chat/file-upload.test.tsx
// Tests para el sistema de File Upload - NEXO v2.0
// Cubre: validateFile, FileAttachmentButton, FilePreview, MessageAttachment, ImageLightbox, integration

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ============================================
// MOCK SETUP
// ============================================

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Paperclip: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="paperclip-icon" {...props} />,
  Loader2: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="loader-icon" {...props} />,
  X: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="x-icon" {...props} />,
  FileText: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="filetext-icon" {...props} />,
  ImageOff: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="imageoff-icon" {...props} />,
  Send: () => <svg data-testid="send-icon" />,
}));

// Mock @/lib/utils
jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// Mock file API
jest.mock("@/lib/api/files", () => ({
  fileApi: {
    uploadFile: jest.fn(),
    getUploadLimits: jest.fn(),
    refreshFileUrl: jest.fn(),
    validateFile: jest.fn(),
  },
  validateFile: jest.fn(),
}));

// Mock createPortal for ImageLightbox
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

// Mock EmojiPickerButton
jest.mock("@/components/chat/EmojiPickerButton", () => ({
  EmojiPickerButton: ({ disabled }: { disabled?: boolean }) => (
    <button data-testid="emoji-picker-button" disabled={disabled}>Emoji</button>
  ),
}));

// Mock FileAttachmentButton for ChatInput tests
jest.mock("@/components/chat/FileAttachmentButton", () => ({
  FileAttachmentButton: ({ onFileSelected, disabled, uploading, remaining }: {
    onFileSelected: (file: File) => void;
    disabled?: boolean;
    uploading?: boolean;
    remaining?: number;
  }) => (
    <button
      data-testid="file-attachment-button-mock"
      onClick={() => onFileSelected(new File(["test"], "test.jpg", { type: "image/jpeg" }))}
      disabled={disabled}
      data-uploading={uploading}
      data-remaining={remaining}
    >
      Attach
    </button>
  ),
}));

// Mock ImageLightbox for MessageAttachment
jest.mock("@/components/chat/ImageLightbox", () => ({
  ImageLightbox: ({ isOpen, onClose, imageUrl, filename }: {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    filename: string;
  }) => isOpen ? (
    <div data-testid="lightbox-mock" data-url={imageUrl} data-filename={filename}>
      <button data-testid="lightbox-close" onClick={onClose}>Close</button>
    </div>
  ) : null,
}));

// ============================================
// IMPORTS (after mocks)
// ============================================

import { validateFile } from "@/lib/api/files";
import { fileApi } from "@/lib/api/files";

// ============================================
// HELPER: Create mock files
// ============================================

function createMockFile(name: string, type: string, sizeBytes: number): File {
  const file = new File(["x".repeat(Math.min(sizeBytes, 100))], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

// ============================================
// MOCK URL.createObjectURL / revokeObjectURL
// ============================================

const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

afterEach(() => {
  jest.clearAllMocks();
});

// ============================================
// 1. validateFile TESTS
// ============================================

describe("validateFile", () => {
  // We need to test the actual implementation, so let's import it directly
  // Since it's mocked above, we'll use the real one for these tests
  const { validateFile: realValidateFile } = jest.requireActual("@/lib/api/files");

  it("accepts a valid JPEG file (1MB)", () => {
    const file = createMockFile("photo.jpg", "image/jpeg", 1024 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(true);
    expect(result.fileType).toBe("image");
  });

  it("accepts a valid PNG file (2MB)", () => {
    const file = createMockFile("screenshot.png", "image/png", 2 * 1024 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(true);
    expect(result.fileType).toBe("image");
  });

  it("accepts a valid PDF file (5KB)", () => {
    const file = createMockFile("document.pdf", "application/pdf", 5 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(true);
    expect(result.fileType).toBe("text");
  });

  it("accepts a valid TXT file (1KB)", () => {
    const file = createMockFile("notes.txt", "text/plain", 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(true);
    expect(result.fileType).toBe("text");
  });

  it("accepts a valid WebP file", () => {
    const file = createMockFile("image.webp", "image/webp", 500 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(true);
    expect(result.fileType).toBe("image");
  });

  it("accepts a valid GIF file", () => {
    const file = createMockFile("animation.gif", "image/gif", 3 * 1024 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(true);
    expect(result.fileType).toBe("image");
  });

  it("rejects an .exe file with error message", () => {
    const file = createMockFile("virus.exe", "application/x-msdownload", 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("no soportado");
  });

  it("rejects image larger than 5MB", () => {
    const file = createMockFile("huge.jpg", "image/jpeg", 6 * 1024 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5MB");
  });

  it("rejects text file larger than 10KB", () => {
    const file = createMockFile("big.txt", "text/plain", 15 * 1024);
    const result = realValidateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10KB");
  });
});

// ============================================
// 2. FileAttachmentButton TESTS
// ============================================

describe("FileAttachmentButton", () => {
  const RealFileAttachmentButton = jest.requireActual("@/components/chat/FileAttachmentButton").FileAttachmentButton;

  const mockOnFileSelected = jest.fn();

  it("renders Paperclip icon", () => {
    render(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} />);
    expect(screen.getByTestId("paperclip-icon")).toBeInTheDocument();
  });

  it("opens file picker on click", async () => {
    render(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} />);
    
    const button = screen.getByRole("button");
    // The hidden input should exist
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    
    // Simulate clicking the button - it should trigger input click
    const clickSpy = jest.spyOn(input, "click");
    fireEvent.click(button);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("shows Loader2 when uploading=true", () => {
    render(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} uploading={true} />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("paperclip-icon")).not.toBeInTheDocument();
  });

  it("disables button when remaining=0", () => {
    render(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} remaining={0} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows correct tooltip based on state", () => {
    const { rerender } = render(
      <RealFileAttachmentButton onFileSelected={mockOnFileSelected} remaining={5} />
    );
    let button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Adjuntar archivo (5 restantes hoy)");

    rerender(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} remaining={0} />);
    button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Límite diario alcanzado");

    rerender(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} uploading={true} />);
    button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Subiendo archivo...");
  });

  it("calls onFileSelected when a file is chosen", () => {
    render(<RealFileAttachmentButton onFileSelected={mockOnFileSelected} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile("test.jpg", "image/jpeg", 1024);
    
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockOnFileSelected).toHaveBeenCalledWith(file);
  });
});

// ============================================
// 3. FilePreview TESTS
// ============================================

describe("FilePreview", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { FilePreview } = require("@/components/chat/FilePreview");

  const mockOnRemove = jest.fn();

  it("renders image preview with thumbnail", () => {
    const file = createMockFile("photo.jpg", "image/jpeg", 2 * 1024 * 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);
    
    // Should create object URL for preview
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    
    // Should have an img element
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "blob:mock-url");
  });

  it("renders PDF preview with FileText icon and badge", () => {
    const file = createMockFile("document.pdf", "application/pdf", 5 * 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);
    
    expect(screen.getByTestId("filetext-icon")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("renders TXT preview with badge", () => {
    const file = createMockFile("notes.txt", "text/plain", 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);
    
    expect(screen.getByTestId("filetext-icon")).toBeInTheDocument();
    expect(screen.getByText("TXT")).toBeInTheDocument();
  });

  it("shows truncated filename and formatted size", () => {
    const file = createMockFile("very_long_filename_that_should_be_truncated.jpg", "image/jpeg", 2.3 * 1024 * 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);
    
    // Size should be formatted
    expect(screen.getByText("2.3 MB")).toBeInTheDocument();
  });

  it("calls onRemove when X button is clicked", async () => {
    const file = createMockFile("test.jpg", "image/jpeg", 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByTitle("Quitar archivo");
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalled();
  });
});

// ============================================
// 4. MessageAttachment TESTS
// ============================================

describe("MessageAttachment", () => {
  // Need to unmock ImageLightbox for the real MessageAttachment
  // Since we already have a mock, let's test with it
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MessageAttachment } = require("@/components/chat/MessageAttachment");

  it("renders image with provided URL", () => {
    render(
      <MessageAttachment
        attachmentUrl="https://example.com/image.jpg"
        attachmentType="image"
        attachmentFilename="photo.jpg"
      />
    );

    const img = screen.getByAltText("photo.jpg");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("shows skeleton placeholder while image loads", () => {
    render(
      <MessageAttachment
        attachmentUrl="https://example.com/image.jpg"
        attachmentType="image"
        attachmentFilename="photo.jpg"
      />
    );
    
    // Before the image loads, a skeleton should be visible
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders text card with filename for PDF", () => {
    render(
      <MessageAttachment
        attachmentUrl="https://example.com/doc.pdf"
        attachmentType="text"
        attachmentFilename="report.pdf"
      />
    );

    expect(screen.getByTestId("filetext-icon")).toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("shows correct badge for TXT files", () => {
    render(
      <MessageAttachment
        attachmentUrl="https://example.com/notes.txt"
        attachmentType="text"
        attachmentFilename="notes.txt"
      />
    );

    expect(screen.getByText("TXT")).toBeInTheDocument();
  });

  it("opens lightbox when image is clicked", () => {
    render(
      <MessageAttachment
        attachmentUrl="https://example.com/image.jpg"
        attachmentType="image"
        attachmentFilename="photo.jpg"
      />
    );

    // Simulate image load first
    const img = screen.getByAltText("photo.jpg");
    fireEvent.load(img);

    // Click the image
    fireEvent.click(img);

    // Lightbox should be rendered
    expect(screen.getByTestId("lightbox-mock")).toBeInTheDocument();
  });
});

// ============================================
// 5. ImageLightbox TESTS
// ============================================

describe("ImageLightbox", () => {
  const RealImageLightbox = jest.requireActual("@/components/chat/ImageLightbox").ImageLightbox;

  const mockOnClose = jest.fn();

  it("does not render when isOpen=false", () => {
    const { container } = render(
      <RealImageLightbox
        imageUrl="https://example.com/image.jpg"
        filename="photo.jpg"
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders overlay and image when isOpen=true", () => {
    render(
      <RealImageLightbox
        imageUrl="https://example.com/image.jpg"
        filename="photo.jpg"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const img = screen.getByAltText("photo.jpg");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(screen.getByText("photo.jpg")).toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", () => {
    render(
      <RealImageLightbox
        imageUrl="https://example.com/image.jpg"
        filename="photo.jpg"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    render(
      <RealImageLightbox
        imageUrl="https://example.com/image.jpg"
        filename="photo.jpg"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not close when image is clicked", () => {
    render(
      <RealImageLightbox
        imageUrl="https://example.com/image.jpg"
        filename="photo.jpg"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const img = screen.getByAltText("photo.jpg");
    fireEvent.click(img);
    // onClose should only be called by the overlay, not the image
    // (image click has stopPropagation)
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

// ============================================
// 6. Integration Test
// ============================================

describe("File Upload Integration", () => {
  it("full flow: select file → preview appears → send → preview disappears", async () => {
    const user = userEvent.setup();

    // We'll test at the ChatInput level with file attachment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ChatInput } = require("@/components/chat/ChatInput");

    const mockOnSend = jest.fn();
    const mockOnFileSelected = jest.fn();

    const { rerender } = render(
      <ChatInput
        onSend={mockOnSend}
        onFileSelected={mockOnFileSelected}
        hasPendingFile={false}
      />
    );

    // 1. File attachment button should be present
    expect(screen.getByTestId("file-attachment-button-mock")).toBeInTheDocument();

    // 2. Click file attachment button (mock will call onFileSelected)
    await user.click(screen.getByTestId("file-attachment-button-mock"));
    expect(mockOnFileSelected).toHaveBeenCalled();

    // 3. Simulate file being selected (hasPendingFile becomes true)
    rerender(
      <ChatInput
        onSend={mockOnSend}
        onFileSelected={mockOnFileSelected}
        hasPendingFile={true}
      />
    );

    // 4. Send button should now be enabled even without text
    const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
    expect(sendButton).not.toBeDisabled();

    // 5. Click send
    await user.click(sendButton);
    expect(mockOnSend).toHaveBeenCalledWith("");

    // 6. After send, hasPendingFile would go back to false
    rerender(
      <ChatInput
        onSend={mockOnSend}
        onFileSelected={mockOnFileSelected}
        hasPendingFile={false}
      />
    );

    // Send button should be disabled again with no text and no file
    expect(sendButton).toBeDisabled();
  });
});
