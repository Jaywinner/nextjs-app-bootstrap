import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzJ3YP5c0cy2-N8GnMgl9N6ai30a7F_ZfHaTfy7s1NUeaGZhZz-MgYtS0nB7JMvFwxe/exec";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, filename } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Send the image to the Google Apps Script webhook
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
        filename: filename || "image.png",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Google Script error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to process image with the model" },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      result,
      message: "Image processed successfully",
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing the image",
      },
      { status: 500 }
    );
  }
}
