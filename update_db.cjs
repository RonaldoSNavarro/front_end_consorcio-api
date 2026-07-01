const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:584796@localhost:5432/consorcio_db' });

async function updateDB() {
    try {
        await client.connect();
        
        // Cota para EM_EXECUCAO
        const resCota1 = await client.query("UPDATE cotas SET status = 'EM_EXECUCAO' WHERE id = (SELECT id FROM cotas LIMIT 1) RETURNING id;");
        console.log("Updated Cota to EM_EXECUCAO:", resCota1.rows[0].id);

        // Cota para EXCLUIDA com atraso
        const resCota2 = await client.query("UPDATE cotas SET status = 'EXCLUIDA' WHERE id = (SELECT id FROM cotas OFFSET 1 LIMIT 1) RETURNING id;");
        const cota2Id = resCota2.rows[0].id;
        console.log("Updated Cota to EXCLUIDA:", cota2Id);

        // Atualiza uma parcela da cota2 para ATRASADA com encargos
        await client.query("UPDATE parcelas SET status = 'ATRASADA', juros = 50.00, multa = 25.00 WHERE cota_id = $1;", [cota2Id]);
        console.log("Updated parcelas to ATRASADA with encargos for Cota:", cota2Id);

    } catch (e) {
        console.error("DB error", e);
    } finally {
        await client.end();
    }
}
updateDB();
