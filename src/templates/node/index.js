const process = require("process");

process.stdin.resume();

// do your thing
process.on("SIGINT", () => {
  process.exit();
});

console.log("process start");
