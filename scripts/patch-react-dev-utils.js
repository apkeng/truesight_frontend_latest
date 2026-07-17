/**
 * Patches react-dev-utils/checkRequiredFiles.js to use fs.constants.F_OK
 * instead of the deprecated top-level fs.F_OK, which triggers
 * [DEP0176] DeprecationWarning on Node 22+ during every
 * `react-scripts build`/`start`.
 *
 * react-dev-utils is archived (CRA is no longer maintained), so no upstream
 * release carries this fix. Runs from the "postinstall" script; idempotent
 * and never fails the install.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-dev-utils",
  "checkRequiredFiles.js"
);

const DEPRECATED = "fs.accessSync(filePath, fs.F_OK)";
const FIXED = "fs.accessSync(filePath, fs.constants.F_OK)";

try {
  const source = fs.readFileSync(target, "utf8");
  if (source.includes(DEPRECATED)) {
    fs.writeFileSync(target, source.replace(DEPRECATED, FIXED));
    console.log("Patched react-dev-utils/checkRequiredFiles.js (DEP0176 fix)");
  }
  // Already patched or upstream changed: nothing to do.
} catch (err) {
  // Missing file (e.g. install without dev deps) is not an error.
  if (err.code !== "ENOENT") {
    console.warn("Could not patch react-dev-utils:", err.message);
  }
}
