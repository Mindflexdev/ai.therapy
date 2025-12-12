const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Copy all files from public to dist
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

console.log('Copying public files to dist...');
fs.readdirSync(publicDir).forEach(item => {
    const srcPath = path.join(publicDir, item);
    const destPath = path.join(distDir, item);
    copyRecursive(srcPath, destPath);
    console.log(`Copied: ${item}`);
});
console.log('Copy complete!');
