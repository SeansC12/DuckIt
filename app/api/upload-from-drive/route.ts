import {
  ErrorResponse,
  extractFileIdFromUrl,
  getErrorMessage,
  SuccessResponse,
} from "@/lib/GoogleDriveUtils";
import { fetchGoogleDriveFileContent } from "@/lib/GoogleDriveUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    const { googleDriveUrl } = body;

    if (!googleDriveUrl) {
      return NextResponse.json(
        { error: "Google Drive URL is required" } as ErrorResponse,
        { status: 400 },
      );
    }

    // Extract file ID from URL
    const fileId = extractFileIdFromUrl(googleDriveUrl);
    if (!fileId) {
      return NextResponse.json(
        { error: "Invalid Google Drive URL format" } as ErrorResponse,
        { status: 400 },
      );
    }

    // fetch file content
    const fileContent = await fetchGoogleDriveFileContent(fileId);

    return NextResponse.json({
      success: true,
      message: "File content extracted successfully",
      fileContent: fileContent,
      fileId: fileId,
    } as SuccessResponse);
  } catch (error: unknown) {
    console.error("Upload from Drive error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch file from Google Drive. Ensure that the file is shared with 'Anyone with the link' ",
        details: getErrorMessage(error),
      } as ErrorResponse,
      { status: 500 },
    );
  }
}
