const { createCanvas } = require('canvas');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
    // Create a canvas
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');

    // Fill background with Twitter blue
    ctx.fillStyle = '#1DA1F2';
    ctx.fillRect(0, 0, 32, 32);

    // Add Twitter bird icon (simplified)
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', 16, 10);

    // Add download arrow
    ctx.fillText('↓', 16, 22);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Convert PNG buffer to ICO
    const ico = await toIco([buffer]);

    // Ensure the public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    // Write the ICO file
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
    console.log('Favicon generated successfully!');
}

generateFavicon().catch(console.error);
