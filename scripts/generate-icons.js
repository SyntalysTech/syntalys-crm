const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '..', 'public', 'logos', 'syntalys-desktop-icon.png');
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

async function generateIcons() {
  // Read source image
  const image = sharp(sourceIcon);
  const metadata = await image.metadata();

  console.log(`Source image: ${metadata.width}x${metadata.height}`);

  // Make it square by using the larger dimension
  const size = Math.max(metadata.width, metadata.height);

  // Create a square canvas with white background and center the image
  const squareImage = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: await sharp(sourceIcon).toBuffer(),
    gravity: 'center'
  }])
  .png();

  const squareBuffer = await squareImage.toBuffer();

  // PNG sizes needed for Tauri
  const pngSizes = [
    { name: '32x32.png', size: 32 },
    { name: '64x64.png', size: 64 },
    { name: '128x128.png', size: 128 },
    { name: '128x128@2x.png', size: 256 },
    { name: 'icon.png', size: 512 },
    // Windows Store logos
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

  // Generate PNG icons
  for (const { name, size: targetSize } of pngSizes) {
    const outputPath = path.join(iconsDir, name);
    await sharp(squareBuffer)
      .resize(targetSize, targetSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${name}`);
  }

  // Generate ICO file (Windows icon) - multiple sizes in one file
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoImages = await Promise.all(
    icoSizes.map(async (s) => {
      return await sharp(squareBuffer)
        .resize(s, s, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();
    })
  );

  // Simple ICO file creation
  const icoPath = path.join(iconsDir, 'icon.ico');
  await createIco(icoImages, icoSizes, icoPath);
  console.log('Generated: icon.ico');

  console.log('\\nAll icons generated successfully!');
}

async function createIco(images, sizes, outputPath) {
  // ICO file format
  const numImages = images.length;

  // Calculate header size
  const headerSize = 6 + (numImages * 16);

  // Prepare image data
  const imageDataArray = [];
  let currentOffset = headerSize;

  for (let i = 0; i < numImages; i++) {
    const pngData = images[i];
    imageDataArray.push({
      size: sizes[i],
      data: pngData,
      offset: currentOffset
    });
    currentOffset += pngData.length;
  }

  // Create ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // Reserved
  header.writeUInt16LE(1, 2);      // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  // Create directory entries
  const directory = Buffer.alloc(numImages * 16);
  for (let i = 0; i < numImages; i++) {
    const img = imageDataArray[i];
    const offset = i * 16;

    directory.writeUInt8(img.size >= 256 ? 0 : img.size, offset);     // Width
    directory.writeUInt8(img.size >= 256 ? 0 : img.size, offset + 1); // Height
    directory.writeUInt8(0, offset + 2);                               // Color palette
    directory.writeUInt8(0, offset + 3);                               // Reserved
    directory.writeUInt16LE(1, offset + 4);                            // Color planes
    directory.writeUInt16LE(32, offset + 6);                           // Bits per pixel
    directory.writeUInt32LE(img.data.length, offset + 8);              // Size of image data
    directory.writeUInt32LE(img.offset, offset + 12);                  // Offset to image data
  }

  // Combine all parts
  const allImageData = Buffer.concat(imageDataArray.map(img => img.data));
  const icoFile = Buffer.concat([header, directory, allImageData]);

  fs.writeFileSync(outputPath, icoFile);
}

generateIcons().catch(console.error);
