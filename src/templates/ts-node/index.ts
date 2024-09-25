import process from "process";

process.stdin.resume();

// do your thing
process.on("SIGINT", () => {
  process.exit();
});
