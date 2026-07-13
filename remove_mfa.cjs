const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:584796@localhost:5432/keycloak_db'
});

async function run() {
  try {
    await client.connect();
    // A senha do DB é postgres ou 584796? No docker-compose é ${DB_PASSWORD:-postgres}
    // Na E2E usamos 584796 para consorcio_db, maybe keycloak_db is postgres.
    const res = await client.query("SELECT id FROM user_entity WHERE username = 'admin'");
    if (res.rows.length === 0) {
      console.log('Admin not found');
      return;
    }
    const userId = res.rows[0].id;
    console.log('Admin ID:', userId);
    
    await client.query("DELETE FROM credential WHERE user_id = $1 AND type = 'otp'", [userId]);
    await client.query("DELETE FROM user_required_action WHERE user_id = $1 AND required_action = 'CONFIGURE_TOTP'", [userId]);
    
    // Add CONFIGURE_TOTP back so the script can configure it again!
    await client.query("INSERT INTO user_required_action (user_id, required_action) VALUES ($1, 'CONFIGURE_TOTP') ON CONFLICT DO NOTHING", [userId]);
    
    console.log('MFA resetted for admin! He will be asked to configure TOTP again.');
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
