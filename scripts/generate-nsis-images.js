const sharp = require('sharp');
const bmp = require('bmp-js');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '..', 'public', 'logos', 'syntalys-desktop-icon.png');
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

async function pngToBmp(pngBuffer, outputPath) {
  const { data, info } = await sharp(pngBuffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert RGB to BGRA (BMP format)
  const bmpData = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    bmpData[i * 4] = data[i * 3 + 2];     // B
    bmpData[i * 4 + 1] = data[i * 3 + 1]; // G
    bmpData[i * 4 + 2] = data[i * 3];     // R
    bmpData[i * 4 + 3] = 255;             // A
  }

  const bmpImage = bmp.encode({
    data: bmpData,
    width: info.width,
    height: info.height
  });

  fs.writeFileSync(outputPath, bmpImage.data);
}

async function generateNsisImages() {
  // Header image: 150x57
  const headerBuffer = await sharp({
    create: {
      width: 150,
      height: 57,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
  .composite([{
    input: await sharp(sourceIcon)
      .resize(50, 50, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toBuffer(),
    left: 95,
    top: 3
  }])
  .png()
  .toBuffer();

  await pngToBmp(headerBuffer, path.join(iconsDir, 'nsis-header.bmp'));
  console.log('Generated: nsis-header.bmp (150x57)');

  // Sidebar image: 164x314
  const sidebarBuffer = await sharp({
    create: {
      width: 164,
      height: 314,
      channels: 3,
      background: { r: 26, g: 54, b: 93 }
    }
  })
  .composite([{
    input: await sharp(sourceIcon)
      .resize(120, 120, { fit: 'contain', background: { r: 26, g: 54, b: 93 } })
      .flatten({ background: { r: 26, g: 54, b: 93 } })
      .toBuffer(),
    left: 22,
    top: 80
  }])
  .png()
  .toBuffer();

  await pngToBmp(sidebarBuffer, path.join(iconsDir, 'nsis-sidebar.bmp'));
  console.log('Generated: nsis-sidebar.bmp (164x314)');

  console.log('NSIS BMP images generated!');
}

generateNsisImages().catch(console.error);
