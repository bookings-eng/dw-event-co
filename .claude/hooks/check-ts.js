const { execFileSync } = require("child_process");
const path = require("path");

let data = "";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(data); } catch { process.exit(0); }
  const file = input.tool_input?.file_path || "";
  if (!/\.(ts|tsx|js|jsx)$/.test(file)) process.exit(0);

  const node = process.execPath;
  let errors = "";

  try {
    execFileSync(node, [path.join("node_modules", "eslint", "bin", "eslint.js"), file], { encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    errors += "ESLint:\n" + (e.stdout || e.message) + "\n";
  }

  try {
    execFileSync(node, [path.join("node_modules", "typescript", "bin", "tsc"), "--noEmit", "--incremental"], { encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    errors += "tsc --noEmit:\n" + (e.stdout || e.message) + "\n";
  }

  if (errors) {
    process.stdout.write(errors.trim() + "\n");
    process.exit(2);
  }
  process.exit(0);
});
