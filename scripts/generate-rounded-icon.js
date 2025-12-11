const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '..', 'public', 'logos', 'syntalys-desktop-icon.png');
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

async function generateIcons() {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const radius = Math.round(size * 0.18); // 18% corner radius
    const padding = Math.round(size * 0.08); // 8% padding

    // Create white rounded rectangle background
    const background = Buffer.from(
      `<svg width="${size}" height="${size}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
      </svg>`
    );

    // Resize the source icon
    const resizedIcon = await sharp(sourceIcon)
      .resize(size - padding * 2, size - padding * 2, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    // Compose: white rounded background + icon centered
    const composedIcon = await sharp(background)
      .composite([{
        input: resizedIcon,
        gravity: 'center'
      }])
      .png()
      .toBuffer();

    // Now apply rounded mask to cut the corners
    const roundedMask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
      </svg>`
    );

    const finalIcon = await sharp(composedIcon)
      .composite([{
        input: roundedMask,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    pngBuffers.push(finalIcon);

    // Save individual PNGs
    if (size === 32) {
      fs.writeFileSync(path.join(iconsDir, '32x32.png'), finalIcon);
      console.log('Generated: 32x32.png');
    } else if (size === 64) {
      fs.writeFileSync(path.join(iconsDir, '64x64.png'), finalIcon);
      console.log('Generated: 64x64.png');
    } else if (size === 128) {
      fs.writeFileSync(path.join(iconsDir, '128x128.png'), finalIcon);
      console.log('Generated: 128x128.png');
    } else if (size === 256) {
      fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), finalIcon);
      fs.writeFileSync(path.join(iconsDir, 'icon.png'), finalIcon);
      console.log('Generated: 128x128@2x.png & icon.png');
    }
  }

  // For ICO - need SOLID background (no transparency) for Windows desktop
  const icoBuffers = [];
  for (const size of sizes) {
    const radius = Math.round(size * 0.18);
    const padding = Math.round(size * 0.08);

    // White solid background (no rounded corners for ICO - Windows handles this)
    const solidIcon = await sharp({
      create: {
        width: size,
        height: size,
        channels: 3, // RGB only, no alpha
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([{
      input: await sharp(sourceIcon)
        .resize(size - padding * 2, size - padding * 2, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255 }
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .toBuffer(),
      gravity: 'center'
    }])
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

    icoBuffers.push(solidIcon);
  }

  // Generate ICO
  const icoBuffer = await toIco(icoBuffers);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);
  console.log('Generated: icon.ico (solid white background)');

  // Generate Windows Store logos
  const storeSizes = [
    { name: 'StoreLogo.png', size: 50 },
    { name: 'Square30x30Logo.png', size: 30 },
    { name: 'Square44x44Logo.png', size: 44 },
    { name: 'Square71x71Logo.png', size: 71 },
    { name: 'Square89x89Logo.png', size: 89 },
    { name: 'Square107x107Logo.png', size: 107 },
    { name: 'Square142x142Logo.png', size: 142 },
    { name: 'Square150x150Logo.png', size: 150 },
    { name: 'Square284x284Logo.png', size: 284 },
    { name: 'Square310x310Logo.png', size: 310 },
  ];

  for (const { name, size } of storeSizes) {
    const padding = Math.round(size * 0.08);

    const storeIcon = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(sourceIcon)
        .resize(size - padding * 2, size - padding * 2, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

    fs.writeFileSync(path.join(iconsDir, name), storeIcon);
  }
  console.log('Generated: Store logos');

  console.log('\nAll icons generated with white background!');
}

generateIcons().catch(console.error);
