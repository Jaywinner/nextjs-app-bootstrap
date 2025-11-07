"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProcessingStatus = "idle" | "uploading" | "processing" | "success" | "error";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus("idle");
      setError(null);
      setResult(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        try {
          setStatus("processing");

          // Call our API route
          const response = await fetch("/api/process-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Data,
              filename: selectedFile.name,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to process image");
          }

          setStatus("success");
          setResult(JSON.stringify(data, null, 2));
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      };

      reader.onerror = () => {
        setStatus("error");
        setError("Failed to read file");
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Image Upload & Model Processing
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload an image to process it through our AI model
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image file to upload and process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 hover:border-primary/50 transition-colors">
              <Upload className="size-12 text-muted-foreground mb-4" />
              <label
                htmlFor="file-input"
                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-semibold text-primary">
                  Click to upload
                </span>{" "}
                or drag and drop
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-96 object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={status === "uploading" || status === "processing"}
                    className="flex-1"
                  >
                    {status === "uploading" || status === "processing" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {status === "uploading" ? "Uploading..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetUpload}
                    disabled={status === "uploading" || status === "processing"}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {status === "success" && (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-500 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Image processed successfully!
                  </p>
                  {result && (
                    <pre className="text-xs bg-background/50 p-3 rounded border overflow-auto max-h-64">
                      {result}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {status === "error" && error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <XCircle className="size-5 text-red-600 dark:text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Error processing image
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
