const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { connection } = require("../services/queue");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Import Models
require("../models/userModel");

// --- CONFIGURATION ---
// Modular image profiles. Add new keys here to support other models in the future.
const IMAGE_PROFILES = {
  User: (pipeline) => pipeline.resize(500, 500, { fit: "cover" }),
  // Default fallback if needed
  default: (pipeline) => pipeline.resize(800, 800, { fit: "inside" }),
};

// --- HELPER FUNCTIONS ---

/**
 * Robustly resolves a file path, checking both root and 'Backend' directories.
 */
const resolveSafePath = (targetPath, checkBackend = true) => {
  let absolutePath = path.resolve(targetPath);

  // 1. Check direct path
  if (fs.existsSync(absolutePath)) return absolutePath;

  // 2. Check inside Backend/ if not found
  if (checkBackend) {
    const backendPath = path.join(process.cwd(), "Backend", targetPath);
    if (fs.existsSync(backendPath)) return backendPath;
  }

  return null;
};

/**
 * Handles the Sharp image processing pipeline.
 */
const processImage = async (inputPath, outputPath, modelName) => {
  sharp.cache(false); // Ensure file handles are released
  const pipeline = sharp(inputPath);

  // Apply transformation based on config
  const transformFn = IMAGE_PROFILES[modelName] || IMAGE_PROFILES.default;
  transformFn(pipeline);

  await pipeline.webp({ quality: 80 }).toFile(outputPath);

  // Verification
  if (!fs.existsSync(outputPath)) throw new Error("File not created");
  const stats = fs.statSync(outputPath);
  if (stats.size === 0) {
    cleanupFile(outputPath); // Clean empty file
    throw new Error("Generated file is empty (0 bytes)");
  }

  return stats;
};

/**
 * Safely deletes a file if it exists.
 */
const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.warn(
      `[Cleanup Warning] Failed to delete ${filePath}: ${err.message}`
    );
  }
  return false;
};

/**
 * Updates the Mongoose document and handles old file cleanup.
 */
const updateDatabase = async (
  modelName,
  fileId,
  fieldName,
  relativeUrl,
  absoluteOutputDir
) => {
  const Model = mongoose.model(modelName);

  // 1. Fetch doc to find old image for cleanup
  const doc = await Model.findById(fileId);
  if (!doc) throw new Error(`${modelName} not found: ${fileId}`);

  // 2. Cleanup old image (if replacing)
  if (doc[fieldName]) {
    const oldFileName = path.basename(doc[fieldName]);
    // Prevent deleting the file we just created if names collide
    const newFileName = path.basename(relativeUrl);

    if (oldFileName !== newFileName) {
      const oldAbsolutePath = path.join(absoluteOutputDir, oldFileName);
      if (cleanupFile(oldAbsolutePath)) {
        console.log(`[Worker] 🗑️ Deleted old image: ${oldFileName}`);
      }
    }
  }

  // 3. Update DB
  await Model.findByIdAndUpdate(fileId, { [fieldName]: relativeUrl });
};

// --- MAIN WORKER ---

const worker = new Worker(
  "media-processing",
  async (job) => {
    const { fileId, filePath, mimeType, outputDir, modelName, fieldName } =
      job.data;

    console.log(`[Worker] 🟢 Job started: ${modelName} (${fileId})`);

    let absoluteInputPath = null;
    let absoluteFinalPath = null;

    try {
      // 1. Validate Input
      absoluteInputPath = resolveSafePath(filePath);
      if (!absoluteInputPath) {
        throw new Error(`Input file missing: ${filePath}`);
      }

      // 2. Prepare Output Directory
      // We force the output into the Backend folder if it exists to keep structure consistent
      let absoluteOutputDir = path.resolve(outputDir);
      if (
        !absoluteOutputDir.includes("Backend") &&
        fs.existsSync(path.join(process.cwd(), "Backend"))
      ) {
        absoluteOutputDir = path.join(process.cwd(), "Backend", outputDir);
      }

      if (!fs.existsSync(absoluteOutputDir)) {
        fs.mkdirSync(absoluteOutputDir, { recursive: true });
      }

      // 3. Process Image
      if (!mimeType.startsWith("image/")) {
        throw new Error("Unsupported MIME type");
      }

      const timestamp = Date.now();
      const finalFilename = `${modelName.toLowerCase()}-${fileId}-${timestamp}.webp`;
      absoluteFinalPath = path.join(absoluteOutputDir, finalFilename);

      console.log(`[Worker] ⚙️ Processing...`);
      const stats = await processImage(
        absoluteInputPath,
        absoluteFinalPath,
        modelName
      );

      console.log(`[Worker] ✅ Created: ${(stats.size / 1024).toFixed(2)} KB`);

      // 4. Generate URL
      // robust relative path calculation
      let relativeUrl = `/${path
        .relative(path.join(process.cwd(), "Backend/public"), absoluteFinalPath)
        .replace(/\\/g, "/")}`;

      // Fallback if path relative calculation fails
      if (!relativeUrl.startsWith("/"))
        relativeUrl = `/uploads/${finalFilename}`;

      // 5. Update Database & Cleanup Old Avatar
      await updateDatabase(
        modelName,
        fileId,
        fieldName,
        relativeUrl,
        absoluteOutputDir
      );

      // 6. Cleanup Input Temp File
      cleanupFile(absoluteInputPath);

      console.log(`[Worker] 🎉 Success: ${relativeUrl}`);
      return relativeUrl;
    } catch (error) {
      console.error(`❌ [Worker Failed] ${error.message}`);

      // Emergency cleanup of partial file
      cleanupFile(absoluteFinalPath);

      throw error;
    }
  },
  {
    connection,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  }
);

console.log("Media Worker started (Modular User Mode)...");
