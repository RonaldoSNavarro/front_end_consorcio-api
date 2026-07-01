const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:584796@localhost:5432/consorcio_db' });

async function updateDB() {
    try {
        await client.connect();
        await client.query("UPDATE parcelas SET status = 'ATRASADA', data_vencimento = CURRENT_DATE - INTERVAL '30 days' WHERE cota_id = 4;");
        console.log("Updated parcelas to ATRASADA for Cota 4");
    } catch (e) {
        console.error("DB error", e);
    } finally {
        await client.end();
    }
}
updateDB();
