import fs from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';

async function test() {
  const [dejavuSerif, dejavuSerifBold] = await Promise.all([
    fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'),
    fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'),
  ]);

  const fonts = [
    { name: 'DejaVu Serif', data: dejavuSerif, weight: 400, style: 'normal' },
    { name: 'DejaVu Serif', data: dejavuSerifBold, weight: 700, style: 'normal' },
  ];

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '500px',
          height: '200px',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#111827',
          padding: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        },
        children: [
          {
            type: 'span',
            props: {
              style: {
                fontFamily: 'DejaVu Serif',
                fontWeight: 700,
                fontSize: '36px',
                color: '#FFFFFF',
              },
              children: 'POLARIS',
            },
          },
          {
            type: 'span',
            props: {
              style: {
                fontFamily: 'DejaVu Serif',
                fontWeight: 700,
                fontSize: '36px',
                color: '#EF4444',
              },
              children: 'VERITAS',
            },
          },
        ],
      },
    },
    { width: 500, height: 200, fonts }
  );

  await sharp(Buffer.from(svg)).png().toFile('test-masthead-render.png');
  console.log('Saved corrected test-masthead-render.png!');
}

test().catch(console.error);
