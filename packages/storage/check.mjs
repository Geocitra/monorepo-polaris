import sharp from 'sharp';
const img = await sharp('/home/pc/projects/polaris-platform/uploads/social/1791863239569-6d620860-9015-40ca-9540-6d7bf9478724.jpg').metadata();
console.log('FORMATTED:', img.width, img.height);
