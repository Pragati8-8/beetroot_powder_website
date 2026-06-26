const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\sama\\Downloads\\ezgif-370566b42661d0d5-jpg';
const destDir = 'c:\\Users\\sama\\OneDrive\\Desktop\\beetroot\\assets\\frames';

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Read and copy all files
try {
    const files = fs.readdirSync(srcDir);
    let count = 0;
    files.forEach(file => {
        if (file.endsWith('.jpg')) {
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, file);
            fs.copyFileSync(srcPath, destPath);
            count++;
        }
    });
    console.log(`Successfully copied ${count} frame files to assets/frames`);
} catch (err) {
    console.error('Error copying files:', err);
    process.exit(1);
}
