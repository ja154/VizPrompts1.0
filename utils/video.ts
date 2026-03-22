/**
 * Computes a perceptual difference score between two canvas frames.
 * Samples a grid of pixels (not every pixel) for performance.
 * Returns a value 0..1 where 0 = identical, 1 = completely different.
 */
const computeFrameDiff = (
  ctx: CanvasRenderingContext2D,
  prevData: Uint8ClampedArray,
  width: number,
  height: number
): number => {
  const current = ctx.getImageData(0, 0, width, height).data;
  const step = 8; // Sample every 8th pixel — fast enough, accurate enough
  let totalDiff = 0;
  let sampleCount = 0;

  for (let i = 0; i < current.length; i += step * 4) {
    const dr = Math.abs(current[i]     - prevData[i]);
    const dg = Math.abs(current[i + 1] - prevData[i + 1]);
    const db = Math.abs(current[i + 2] - prevData[i + 2]);
    totalDiff += (dr + dg + db) / (3 * 255);
    sampleCount++;
  }

  return sampleCount > 0 ? totalDiff / sampleCount : 0;
};

/**
 * Extracts frames from a video using adaptive scene-change-aware sampling.
 *
 * Strategy:
 * 1. Do a fast first-pass scan at low resolution to detect scene changes
 *    (frames where pixel diff exceeds a threshold = likely cut or major motion).
 * 2. Always include the detected scene-change frames as keyframes.
 * 3. Fill remaining frame slots with evenly-distributed frames from
 *    segments between keyframes to maintain temporal coverage.
 * 4. Deduplicate near-identical frames (diff < dedup threshold).
 *
 * This means a video with 3 hard cuts gets frames from each scene,
 * rather than 12 frames all from the longest static segment.
 *
 * @param videoFile     The video file to process.
 * @param maxFrames     Maximum frames to extract (default 16).
 * @param onProgress    Progress callback (0..1 ratio, current, total).
 */
export const extractFramesFromVideo = (
  videoFile: File,
  maxFrames = 16,
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');

    // Two canvases: one low-res for diff scanning, one full-res for capture
    const scanCanvas = document.createElement('canvas');
    const captureCanvas = document.createElement('canvas');
    const scanCtx = scanCanvas.getContext('2d');
    const captureCtx = captureCanvas.getContext('2d');

    if (!scanCtx || !captureCtx) {
      URL.revokeObjectURL(videoUrl);
      return reject(new Error('Could not create canvas context.'));
    }

    const cleanup = () => URL.revokeObjectURL(videoUrl);

    video.onerror = () => {
      cleanup();
      reject(new Error('Could not process video. Try a different format (e.g. MP4).'));
    };

    video.onloadedmetadata = async () => {
      video.muted = true;
      video.playsInline = true;

      const duration = video.duration;
      if (!isFinite(duration) || duration <= 0) {
        cleanup();
        return reject(new Error('Video has an invalid duration.'));
      }

      // --- Scan canvas: 160×90, used only for diff computation ---
      const SCAN_W = 160;
      const SCAN_H = 90;
      scanCanvas.width = SCAN_W;
      scanCanvas.height = SCAN_H;

      // --- Capture canvas: max 1280px on longest edge ---
      const MAX_DIM = 1280;
      let capW = video.videoWidth;
      let capH = video.videoHeight;
      if (capW > MAX_DIM || capH > MAX_DIM) {
        if (capW >= capH) {
          capH = Math.round(capH * (MAX_DIM / capW));
          capW = MAX_DIM;
        } else {
          capW = Math.round(capW * (MAX_DIM / capH));
          capH = MAX_DIM;
        }
      }
      captureCanvas.width = capW;
      captureCanvas.height = capH;

      // -------------------------------------------------------
      // PHASE 1: Fast scan — sample ~60 evenly-spaced timestamps
      // and record the perceptual diff at each point.
      // -------------------------------------------------------
      const SCAN_SAMPLES = Math.min(60, Math.floor(duration * 10)); // ~1 per 100ms, max 60
      const scanInterval = duration / (SCAN_SAMPLES + 1);
      const diffScores: Array<{ t: number; diff: number }> = [];

      onProgress?.(0, 0, maxFrames);

      let prevScanData: Uint8ClampedArray | null = null;

      const seekTo = (t: number): Promise<void> =>
        new Promise(res => {
          video.onseeked = () => res();
          video.currentTime = t;
        });

      for (let i = 1; i <= SCAN_SAMPLES; i++) {
        const t = scanInterval * i;
        await seekTo(t);
        scanCtx.drawImage(video, 0, 0, SCAN_W, SCAN_H);

        if (prevScanData) {
          const diff = computeFrameDiff(scanCtx, prevScanData, SCAN_W, SCAN_H);
          diffScores.push({ t, diff });
        }
        prevScanData = scanCtx.getImageData(0, 0, SCAN_W, SCAN_H).data.slice();
      }

      // -------------------------------------------------------
      // PHASE 2: Identify scene change timestamps.
      // A "scene change" is any diff spike that is both:
      //   > absolute threshold (0.12 = 12% pixel change)
      //   > 1.5× the median diff (relative to this video's motion level)
      // -------------------------------------------------------
      const ABS_THRESHOLD = 0.12;
      const REL_MULTIPLIER = 1.5;

      const sortedDiffs = [...diffScores].sort((a, b) => a.diff - b.diff);
      const medianDiff = sortedDiffs[Math.floor(sortedDiffs.length / 2)]?.diff ?? 0;
      const relThreshold = medianDiff * REL_MULTIPLIER;
      const effectiveThreshold = Math.max(ABS_THRESHOLD, relThreshold);

      const sceneChangeTimes = diffScores
        .filter(d => d.diff > effectiveThreshold)
        // Minimum 0.5s gap between detected cuts to avoid clustering
        .reduce<number[]>((acc, d) => {
          if (acc.length === 0 || d.t - acc[acc.length - 1] > 0.5) {
            acc.push(d.t);
          }
          return acc;
        }, []);

      // -------------------------------------------------------
      // PHASE 3: Build final timestamp list.
      // Reserve slots for scene-change keyframes, distribute
      // remaining slots evenly across temporal segments.
      // -------------------------------------------------------
      const keyframeTimes = sceneChangeTimes.slice(0, Math.floor(maxFrames * 0.5));
      const remainingSlots = maxFrames - keyframeTimes.length;

      // Segment the timeline around keyframes and sample within each
      const boundaries = [0, ...keyframeTimes, duration];
      const segmentSlots = Math.max(1, Math.floor(remainingSlots / (boundaries.length - 1)));

      const fillTimes: number[] = [];
      for (let i = 0; i < boundaries.length - 1; i++) {
        const segStart = boundaries[i];
        const segEnd = boundaries[i + 1];
        const segLen = segEnd - segStart;
        const slots = i === boundaries.length - 2 ? remainingSlots - fillTimes.length : segmentSlots;
        for (let j = 1; j <= slots; j++) {
          fillTimes.push(segStart + (segLen * j) / (slots + 1));
        }
      }

      // Merge keyframes + fill frames, sort chronologically
      const allTimes = [...keyframeTimes, ...fillTimes]
        .sort((a, b) => a - b)
        // Clamp to valid range
        .filter(t => t > 0 && t < duration);

      // Take at most maxFrames
      const targetTimes = allTimes.slice(0, maxFrames);

      // -------------------------------------------------------
      // PHASE 4: Capture high-res frames at selected timestamps.
      // Deduplicate: skip a frame if diff vs previous capture < 0.04
      // -------------------------------------------------------
      const DEDUP_THRESHOLD = 0.04;
      const frames: string[] = [];
      let prevCaptureData: Uint8ClampedArray | null = null;
      let prevCaptureScan: Uint8ClampedArray | null = null;

      for (let i = 0; i < targetTimes.length; i++) {
        const t = targetTimes[i];
        await seekTo(t);

        // Check dedup using scan canvas (fast)
        scanCtx.drawImage(video, 0, 0, SCAN_W, SCAN_H);
        const scanData = scanCtx.getImageData(0, 0, SCAN_W, SCAN_H).data.slice();

        if (prevCaptureScan) {
          const diff = computeFrameDiff(scanCtx, prevCaptureScan, SCAN_W, SCAN_H);
          if (diff < DEDUP_THRESHOLD) {
            // Near-identical frame — skip it
            continue;
          }
        }

        // Capture at full resolution
        captureCtx.drawImage(video, 0, 0, capW, capH);
        const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.82);

        if (dataUrl.length > 'data:image/jpeg;base64,'.length + 100) {
          frames.push(dataUrl);
          prevCaptureData = captureCtx.getImageData(0, 0, capW, capH).data.slice();
          prevCaptureScan = scanData;
        }

        onProgress?.(
          Math.round(((i + 1) / targetTimes.length) * 100),
          i + 1,
          targetTimes.length
        );
      }

      onProgress?.(100, frames.length, frames.length);
      cleanup();
      resolve(frames);
    };

    video.preload = 'auto';
    video.src = videoUrl;
  });
};

/**
 * Returns duration, width, height of a video file.
 */
export const getVideoMetadata = (file: File): Promise<{ duration: number; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.src = url;
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata.'));
    };
  });
};

/**
 * Converts an image File to a compressed JPEG data URL.
 * Resizes to max 1920px on the longest edge, quality 0.82.
 */
export const imageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const MAX_DIM = 1920;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          height = Math.round(height * (MAX_DIM / width));
          width = MAX_DIM;
        } else {
          width = Math.round(width * (MAX_DIM / height));
          height = MAX_DIM;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Could not create canvas context.'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('File could not be loaded as an image.'));
    };

    img.src = url;
  });
};
