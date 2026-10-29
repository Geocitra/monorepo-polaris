async function test() {
  const res = await fetch('http://localhost:3001/jonandabrahman/profil');
  const text = await res.text();
  console.log('Profil: Contains <span>Instagram</span>:', text.includes('<span>Instagram</span>'));
  console.log('Profil: Contains search trigger title:', text.includes('title="Cari artikel, regulasi, atau isu"'));

  const resHome = await fetch('http://localhost:3001/jonandabrahman');
  const textHome = await resHome.text();
  console.log('Home: Contains <span>Instagram</span>:', textHome.includes('<span>Instagram</span>'));
  console.log('Home: Contains @jonanda on navbar:', textHome.includes('@jonandabrahman') || textHome.includes('>@jonanda<'));
}
test();
