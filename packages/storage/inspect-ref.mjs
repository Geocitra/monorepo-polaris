import sharp from 'sharp';

async function test() {
  const meta = await sharp('../../uploads/references/poster/Techno Veritas Volume 1 Issue 1.jpg').metadata();
  console.log('Techno Veritas metadata:', meta);
}
test();
