import sharp from './packages/storage/node_modules/sharp/lib/index.js';

async function check() {
  const metadata = await sharp('./uploads/references/poster/Techno Veritas Volume 1 Issue 1.jpg').metadata();
  console.log('Techno Veritas:', metadata.width, 'x', metadata.height, 'channels:', metadata.channels);
}
check();
