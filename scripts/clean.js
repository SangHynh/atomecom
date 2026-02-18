const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    red: "\x1b[31m"
};

const dirsToClean = [
    path.join(__dirname, '../node_modules'),
    path.join(__dirname, '../client/node_modules'),
    path.join(__dirname, '../server/node_modules'),
    path.join(__dirname, '../pnpm-lock.yaml'),
    path.join(__dirname, '../client/pnpm-lock.yaml'),
    path.join(__dirname, '../server/pnpm-lock.yaml'),
    path.join(__dirname, '../package-lock.json'),
    path.join(__dirname, '../client/package-lock.json'),
    path.join(__dirname, '../server/package-lock.json'),
];

console.log(`${colors.bright}${colors.red}🗑️  Cleaning Project...${colors.reset}\n`);

dirsToClean.forEach(itemPath => {
    if (fs.existsSync(itemPath)) {
        try {
            console.log(`${colors.yellow}  ➤ Removing: ${itemPath}${colors.reset}`);
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`${colors.green}  ✓ Removed${colors.reset}`);
        } catch (err) {
            console.error(`${colors.red}  ✗ Failed to remove ${itemPath}: ${err.message}${colors.reset}`);
        }
    } else {
        // console.log(`${colors.blue}  ℹ Ignored (not found): ${itemPath}${colors.reset}`);
    }
});

console.log(`\n${colors.bright}${colors.green}✨ Project Cleaned!${colors.reset}\n`);
