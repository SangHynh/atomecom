const fs = require("fs");
const path = require("path");

// ANSI colors for better output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

const dirs = [
  {
    name: "server",
    path: path.join(__dirname, "../server"),
    envExample: "sample.env",
    env: ".env",
  },
  {
    name: "client",
    path: path.join(__dirname, "../client"),
    envExample: "sample.env",
    env: ".env",
  },
];

console.log(
  `${colors.bright}${colors.cyan}🚀 Starting Project Environment Setup...${colors.reset}\n`,
);

// 1. Setup Environment Variables
console.log(
  `${colors.bright}${colors.blue}📝 Checking Environment Variables...${colors.reset}`,
);
dirs.forEach((dir) => {
  const envPath = path.join(dir.path, dir.env);
  const examplePath = path.join(dir.path, dir.envExample);

  if (fs.existsSync(envPath)) {
    console.log(
      `${colors.green}  ✓ ${dir.name}: .env already exists${colors.reset}`,
    );
  } else if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log(
      `${colors.green}  ✓ ${dir.name}: Created .env from ${dir.envExample}${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.yellow}  ⚠ ${dir.name}: No ${dir.envExample} found to create .env${colors.reset}`,
    );
  }
});

console.log(
    `\n${colors.bright}${colors.green}✅ Environment Setup Completed!${colors.reset}`,
);
