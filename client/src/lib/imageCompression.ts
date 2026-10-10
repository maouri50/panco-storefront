export const MAX_PRODUCT_IMAGE_BYTES = 2_400_000;

const MAX_DIMENSION = 2400;
const JPEG_QUALITIES = [0.9, 0.84, 0.78, 0.72, 0.66, 0.6, 0.54];

type LoadedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
};

export type PreparedProductImage = {
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  data: string;
  originalBytes: number;
  finalBytes: number;
  compressed: boolean;
};

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The image could not be read."));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file).then(bitmap => ({ source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ source: image, width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The image could not be decoded. Please choose a JPEG, PNG, or WebP photo."));
    };
    image.src = objectUrl;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("The image could not be compressed.")), "image/jpeg", quality);
  });
}

function jpegFileName(name: string): string {
  const withoutExtension = name.replace(/\.[^.]+$/, "") || "product-image";
  return `${withoutExtension}.jpg`;
}

/**
 * Keeps small originals untouched. Larger photos are resized only when needed,
 * preserving the original aspect ratio and all image content, then compressed
 * as high-quality JPEG until they fit the server-safe upload limit.
 */
export async function prepareProductImage(file: File): Promise<PreparedProductImage> {
  if (file.size <= MAX_PRODUCT_IMAGE_BYTES) {
    return {
      fileName: file.name,
      contentType: file.type as PreparedProductImage["contentType"],
      data: await readAsDataUrl(file),
      originalBytes: file.size,
      finalBytes: file.size,
      compressed: false,
    };
  }

  const image = await loadImage(file);
  let scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));

  try {
    for (let pass = 0; pass < 5; pass += 1) {
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser cannot prepare this image.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image.source, 0, 0, width, height);

      for (const quality of JPEG_QUALITIES) {
        const blob = await canvasBlob(canvas, quality);
        if (blob.size <= MAX_PRODUCT_IMAGE_BYTES) {
          return {
            fileName: jpegFileName(file.name),
            contentType: "image/jpeg",
            data: await readAsDataUrl(blob),
            originalBytes: file.size,
            finalBytes: blob.size,
            compressed: true,
          };
        }
      }
      scale *= 0.82;
    }
  } finally {
    image.close?.();
  }

  throw new Error("This photo is still too large after automatic compression. Please choose a smaller image.");
}
