async function checkPage(path, name) {
  try {
    const res = await fetch(`http://localhost:3001${path}`);
    const html = await res.text();
    const status = res.status;
    const headerCount = (html.match(/<header/g) || []).length;
    const footerCount = (html.match(/<footer/g) || []).length;

    const has150K = html.includes('150K');
    const hasUnlock = html.includes('Unlock Public Trust');
    const hasGovernance = html.includes('Governance');
    const hasVisualData = html.includes('Visual Data');

    console.log(`[${name}] Status: ${status} | Headers: ${headerCount} | Footers: ${footerCount}`);
    console.log(`  - has 150K dummy: ${has150K}`);
    console.log(`  - has Unlock Public Trust: ${hasUnlock}`);
    console.log(`  - has Governance: ${hasGovernance}`);
    console.log(`  - has Visual Data: ${hasVisualData}`);
  } catch (e) {
    console.error(`[${name}] Error:`, e.message);
  }
}

async function run() {
  await checkPage('/ahmadfauzi?preview_template=xenon-mint', 'BERANDA');
  await checkPage('/ahmadfauzi/profil?preview_template=xenon-mint', 'PROFIL');
  await checkPage('/ahmadfauzi/artikel?preview_template=xenon-mint', 'ARTIKEL');
  await checkPage('/ahmadfauzi/infografis?preview_template=xenon-mint', 'INFOGRAFIS');
  await checkPage('/ahmadfauzi/kontak?preview_template=xenon-mint', 'KONTAK');
}

run();
