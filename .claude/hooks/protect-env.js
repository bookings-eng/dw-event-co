let data = "";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(data); } catch { process.exit(0); }
  const tool = input.tool_name;
  const deny = (reason) => console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  }));

  if (tool === "Edit" || tool === "Write") {
    const path = input.tool_input?.file_path || "";
    if (/(^|[\\/])\.env\.local$/.test(path)) {
      deny(".env.local is protected — edit it by hand, not through Claude.");
    }
  }

  if (tool === "Bash") {
    const cmd = input.tool_input?.command || "";
    if (/\bgit\s+(add|commit)\b/.test(cmd) && /\.env\.local/.test(cmd)) {
      deny(".env.local must not be staged or committed.");
    }
  }
});
