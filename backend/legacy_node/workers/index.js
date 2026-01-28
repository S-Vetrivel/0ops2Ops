require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const connectMongo = require("../config/connectMongo");
const { mediaQueue } = require("../services/queue"); // Import queue to check jobs

const startWorkers = async () => {
  try {
    console.log("🔄 Connecting to Database for Workers...");

    // 1. Connect to MongoDB FIRST
    await connectMongo();
    console.log("✅ Database connected");

    // 2. Check for Failed/Stalled Jobs and Retry them
    // This handles "pending works" that might have failed if the server crashed previously
    const failedJobs = await mediaQueue.getJobs(["failed"]);
    if (failedJobs.length > 0) {
      console.log(
        `⚠️ Found ${failedJobs.length} failed jobs. Retrying them now...`
      );
      for (const job of failedJobs) {
        await job.retry();
      }
      console.log("✅ Failed jobs have been re-queued.");
    }

    console.log("🔄 Starting worker processor...");

    // 3. Import the worker ONLY after DB is connected
    require("./mediaWorker");

    console.log("✅ All workers initialized and listening for new jobs...");
  } catch (error) {
    console.error("❌ Worker startup failed:", error);
    process.exit(1);
  }
};

startWorkers();
