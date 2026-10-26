import fs from 'node:fs/promises';
import satori from 'satori';

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
          gap: '8px',
        },
        children: [
          {
            type: 'span',
            props: {
              style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '32px', color: '#FFFFFF' },
              children: 'POLARIS',
            },
          },
          {
            type: 'span',
            props: {
              style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '32px', color: '#EF4444' },
              children: 'VERITAS',
            },
          },
        ],
      },
    },
    { width: 500, height: 200, fonts }
  );

  console.log('SVG contains POLARIS:', svg.includes('POLARIS'));
  console.log('SVG contains VERITAS:', svg.includes('VERITAS'));
}

test().catch(console.error);
