"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { getApiBaseUrl, uploadService } from "@/services/apiClient";

const MAX_RESUME_SIZE = 10 * 1024 * 1024;

export default function ResumeManager({ resumeUrl, onUploaded }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_RESUME_SIZE) {
      setError("Resume must be 10 MB or smaller.");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const response = await uploadService.uploadResume(file);
      const uploadedUrl = response?.data?.url || response?.url;
      if (!uploadedUrl) {
        throw new Error("The upload completed without returning a resume link.");
      }
      onUploaded(uploadedUrl);
    } catch (uploadError) {
      setError(uploadError.message || "Resume upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    setError("");
    setDownloading(true);
    try {
      const apiRoot = getApiBaseUrl().replace(/\/api\/?$/, "");
      const fileUrl = new URL(resumeUrl, `${apiRoot}/`);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Resume download failed with HTTP status ${response.status}.`);
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileUrl.pathname.split("/").pop() || "resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (downloadError) {
      setError(downloadError.message || "Resume download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a resume file"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-lg border border-[#4B9C93] text-[#4B9C93] text-sm font-semibold hover:bg-[#4B9C93]/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "Uploading..." : resumeUrl ? "Upload New Resume" : "Add Resume"}
        </button>
        {resumeUrl && (
          <button
            id="download-resume-btn"
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 rounded-lg bg-[#4B9C93] text-white text-sm font-semibold hover:bg-[#3d867e] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5 shadow-sm shadow-[#4B9C93]/20"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Downloading..." : "Download Resume"}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
