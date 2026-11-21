"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { RotateCcw, X, ZoomIn } from "lucide-react";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function getRotatedSize(width, height, degrees) {
  const radians = (degrees * Math.PI) / 180;
  return {
    width: Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians)),
    height: Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians)),
  };
}

async function createCroppedFile(imageSrc, pixelCrop, rotation, originalFile) {
  const image = await createImage(imageSrc);
  const radians = (rotation * Math.PI) / 180;
  const rotatedSize = getRotatedSize(image.naturalWidth, image.naturalHeight, rotation);
  const rotatedCanvas = document.createElement("canvas");

  rotatedCanvas.width = Math.ceil(rotatedSize.width);
  rotatedCanvas.height = Math.ceil(rotatedSize.height);

  const rotatedContext = rotatedCanvas.getContext("2d");
  rotatedContext.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  rotatedContext.rotate(radians);
  rotatedContext.drawImage(
    image,
    -image.naturalWidth / 2,
    -image.naturalHeight / 2,
    image.naturalWidth,
    image.naturalHeight
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = 1024;
  outputCanvas.height = 1024;
  const outputContext = outputCanvas.getContext("2d");
  outputContext.drawImage(
    rotatedCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    1024,
    1024
  );

  const outputType =
    originalFile.type === "image/png"
      ? "image/png"
      : originalFile.type === "image/webp"
        ? "image/webp"
        : originalFile.type === "image/svg+xml"
          ? "image/png"
          : "image/jpeg";
  const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve, outputType, 0.92));
  if (!blob) throw new Error("Could not prepare the cropped image.");

  const extension =
    outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
  const baseName = originalFile.name.replace(/\.[^/.]+$/, "") || "profile-photo";
  return new File([blob], `${baseName}-cropped.${extension}`, {
    type: outputType,
  });
}

export default function ProfileImageEditor({ file, onCancel, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState("");
  const closeButtonRef = useRef(null);

  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isPreparing) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreparing, onCancel]);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const handleCropComplete = (_, nextCrop) => setCroppedAreaPixels(nextCrop);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setError("");
    setIsPreparing(true);
    try {
      const croppedFile = await createCroppedFile(
        imageUrl,
        croppedAreaPixels,
        rotation,
        file
      );
      await onApply(croppedFile);
    } catch (applyError) {
      setError(applyError?.message || "Could not prepare the cropped image.");
    } finally {
      setIsPreparing(false);
    }
  };

  if (!file) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-image-editor-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPreparing) onCancel();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="profile-image-editor-title" className="font-bold text-slate-900">
              Adjust profile photo
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Drag the image to set the crop.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isPreparing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed"
            aria-label="Cancel image editing"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[360px] max-h-[55vh] bg-slate-950">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <ZoomIn className="h-4 w-4 shrink-0" />
            <span className="w-12 text-xs font-semibold">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-2 flex-1 cursor-pointer accent-[#4B9C93]"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setRotation((current) => (current + 90) % 360)}
              disabled={isPreparing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              Rotate
            </button>
            <button
              type="button"
              onClick={() => {
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
              }}
              disabled={isPreparing}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>

          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPreparing}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isPreparing || !croppedAreaPixels}
              className="rounded-lg bg-[#4B9C93] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d867e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPreparing ? "Preparing..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
