import bcrypt from 'bcrypt';

async function run() {
  const hash = await bcrypt.hash('password123', 10);
  console.log('HASH:', hash);
}

run().catch(console.error);
