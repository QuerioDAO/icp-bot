const sqlite3 = require('sqlite3').verbose();

function openDatabase(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(db);
            }
        });
    });
}

function runSql(db, sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function runMigrations(dbPath) {
    let db;
    try {
        db = await openDatabase(dbPath);

        const migrations = [
            {
                up: async () => {
                    await runSql(db, `
                        CREATE TABLE IF NOT EXISTS canisters
                        (
                            id text NOT NULL,
                            code_hash text,
                            status int,
                            domain text,
                            updated_at time NOT NULL,
                            UNIQUE (id)
                        );

                        CREATE INDEX IF NOT EXISTS idx_canisters_id ON canisters(id);
                        CREATE INDEX IF NOT EXISTS idx_canisters_code_hash ON canisters(code_hash);
                        CREATE INDEX IF NOT EXISTS idx_canisters_id_code_hash ON canisters(id, code_hash);
                        CREATE INDEX IF NOT EXISTS idx_canisters_status ON canisters(status);
                    `);
                },
                down: async () => {
                    await runSql(db, `
                        DROP TABLE canisters;

                        DROP INDEX IF EXISTS idx_canisters_id;
                        DROP INDEX IF EXISTS idx_canisters_code_hash;
                        DROP INDEX IF EXISTS idx_canisters_id_code_hash;
                        DROP INDEX IF EXISTS idx_canisters_status;
                    `);
                }
            },
        ];

        await runSql(db, 'BEGIN TRANSACTION');
        for (const migration of migrations) {
            await migration.up();
        }
        await runSql(db, 'COMMIT');
    } catch (error) {
        console.error('Migration failed:', error);
        await runSql(db, 'ROLLBACK');
    } finally {
        if (db) {
            db.close();
        }
    }
}

module.exports = {
    runMigrations,
};
