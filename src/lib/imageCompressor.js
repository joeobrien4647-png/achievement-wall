/**
 * Image compression utilities for localStorage storage.
 * Resizes and re-encodes images to reduce their byte footprint.
 * Uses OffscreenCanvas where available, falling back to a regular canvas.
 */

/**
 * Compress an image data URL to fit within the given dimensions at
 * the given quality level. Maintains aspect ratio.
 *
 * @param {string} dataUrl        Base64 data URL of the source image
 * @param {object} options
 * @param {number} options.maxWidth   Maximum width in pixels (default 800)
 * @param {number} options.maxHeight  Maximum height in pixels (default 800)
 * @param {number} options.quality    JPEG quality 0-1 (default 0.7)
 * @returns {Promise<string>}     Compressed base64 data URL
 */
export function compressImage(dataUrl, { maxWidth = 800, maxHeight = 800, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Compute scaled dimensions preserving aspect ratio
        const { width, height } = fitDimensions(img.width, img.height, maxWidth, maxHeight);

        // Prefer OffscreenCanvas for better performance (web workers, no DOM needed)
        if (typeof OffscreenCanvas !== "undefined") {
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.convertToBlob({ type: "image/jpeg", quality }).then((blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read compressed blob"));
            reader.readAsDataURL(blob);
          }).catch(reject);
        } else {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = dataUrl;
  });
}

/**
 * Estimate the byte size of a base64 data URL.
 * A data URL has the form "data:<mime>;base64,<encoded>".
 * Each base64 character represents 6 bits, so 4 chars = 3 bytes.
 *
 * @param {string} dataUrl  Base64 data URL
 * @returns {number}        Approximate size in bytes
 */
export function estimateSize(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return 0;
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) return 0;
  const base64 = dataUrl.slice(commaIndex + 1);
  // Remove padding characters before calculating
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor(((base64.length * 3) / 4) - padding);
}

/**
 * Compute dimensions that fit within maxWidth x maxHeight
 * while preserving the original aspect ratio.
 */
function fitDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.round(srcWidth * scale),
    height: Math.round(srcHeight * scale),
  };
}
