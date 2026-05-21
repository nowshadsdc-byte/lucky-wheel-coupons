import fs from "fs";
import path from "path";

const distServerDir = path.resolve(process.cwd(), "dist", "server");
const sourceFile = path.join(distServerDir, "index.js");
const targetFile = path.join(distServerDir, "server.js");

if (!fs.existsSync(sourceFile)) {
  console.warn("Warning: dist/server/index.js not found. Skipping server.js generation.");
  process.exit(0);
}

if (fs.existsSync(targetFile)) {
  process.exit(0);
}

fs.copyFileSync(sourceFile, targetFile);
console.log("Created dist/server/server.js from dist/server/index.js");
