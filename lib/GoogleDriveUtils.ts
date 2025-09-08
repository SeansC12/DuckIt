// sample url: https://drive.google.com/file/d/1jnvYxbkM9ALR-DZPD_5cvVhJHwqQ1xpu/view?usp=share_link
// export fileId from google drive link
export function extractFileIdFromUrl(url: string) {
  const cleanUrl = url.split("?")[0].split("#")[0];

  // Pattern 1: /file/d/FILE_ID/ or /document/d/FILE_ID/
  const filePattern = /\/(?:file|document)\/d\/([a-zA-Z0-9-_]+)/;
  const fileMatch = cleanUrl.match(filePattern);
  if (fileMatch) {
    return fileMatch[1];
  }

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const idPattern = /[?&]id=([a-zA-Z0-9-_]+)/;
  const idMatch = url.match(idPattern);
  if (idMatch) {
    return idMatch[1];
  }

  return null;
}

// convert URL to download link
export function convertToDirectDownloadUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// fetch file content from google drive
export async function fetchGoogleDriveFileContent(fileId: string) {
  const downloadUrl = convertToDirectDownloadUrl(fileId);

  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`,
      );
    }

    // Check if the response is actually file content or Google's virus scan warning
    const contentType = response.headers.get("content-type");
    const text = await response.text();

    // Google Drive shows a virus scan warning for large files
    if (text.includes("Google Drive - Virus scan warning")) {
      throw new Error(
        "File is too large or requires manual download confirmation",
      );
    }

    // Check if we got HTML instead of plain text
    if (
      (contentType && contentType.includes("text/html")) ||
      text.trim().startsWith("<!DOCTYPE") ||
      text.trim().startsWith("<html")
    ) {
      // Check for specific Google Drive error messages
      if (
        text.includes("access denied") ||
        text.includes("permission denied")
      ) {
        throw new Error(
          'File access denied. Make sure the file is shared with "Anyone with the link"',
        );
      }

      if (text.includes("file not found") || text.includes("404")) {
        throw new Error("File not found. Please check the URL");
      }
    }

    return text;
  } catch (error) {
    console.log("Error fetching Google Drive file:", error);
    throw error;
  }
}

// response types
export interface SuccessResponse {
  success: true;
  message: string;
  fileContent: string;
  fileId: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

// error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}
