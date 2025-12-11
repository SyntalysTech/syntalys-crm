const toIco = require('to-ico');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '..', 'public', 'logos', 'syntalys-desktop-icon.png');
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

async function generateIco() {
  // Create multiple sizes for ICO
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const buffer = await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();
    pngBuffers.push(buffer);
  }

  // Generate ICO with multiple sizes
  const icoBuffer = await toIco(pngBuffers);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

  console.log('icon.ico generated successfully!');
  console.log('Size:', fs.statSync(path.join(iconsDir, 'icon.ico')).size, 'bytes');
}

generateIco().catch(console.error);
