import fs from 'node:fs/promises';
import satori from 'satori';

async function test() {
  const [anton, bebas, jakarta, dejavuSerif, dejavuSerifBold] = await Promise.all([
    fs.readFile('../../assets/fonts/Anton-Regular.ttf'),
    fs.readFile('../../assets/fonts/BebasNeue-Regular.ttf'),
    fs.readFile('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'),
    fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'),
  ]);

  const fonts = [
    { name: 'Anton', data: anton, weight: 400, style: 'normal' },
    { name: 'Bebas Neue', data: bebas, weight: 400, style: 'normal' },
    { name: 'Plus Jakarta Sans', data: jakarta, weight: 600, style: 'normal' },
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
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          padding: '20px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '24px', color: '#9E0B0F' },
              children: 'POLARIS VERITAS',
            },
          },
          {
            type: 'div',
            props: {
              style: { fontFamily: 'Bebas Neue', fontSize: '32px', color: '#111827' },
              children: 'MALAM JAGO MERAH',
            },
          },
        ],
      },
    },
    { width: 500, height: 200, fonts }
  );

  console.log('Satori render success! SVG length:', svg.length);
}

test().catch(console.error);
