const { WARNING } = require("./logs");
const sqlite3 = require('sqlite3').verbose();
const util = require('util');

function formatNull(t) {
  if (JSON.stringify(t) == "null") {
    return t;
  } else if (!t) {
    return null;
  }
  else {
    return "'" + t + "'";
  }
}

function formatText(t) {
  return t?.replace(/'/g, "''");
}

function formatInt(t) {
    return t ? t : null;
  }

class DB {
  constructor(dbFile) {
    this.db = new sqlite3.Database(dbFile);
    this.dbAll = util.promisify(this.db.all.bind(this.db));
  }

  async saveCanisters(canisters) {

    this.db.serialize(() => {
      this.db.run('PRAGMA foreign_keys=OFF;');
      this.db.run('BEGIN TRANSACTION;');

      for (let i = 0; i < canisters.length; i++) {
        try {
          let c = canisters[i];
          let values = `'${c.canister_id}', \
                        ${formatNull(c.code_hash)}, \
                        ${formatInt(c.status)}, \
                        ${formatNull(c.domain)},
                        datetime('now')`;

          this.db.run(`
            UPDATE canisters SET code_hash= ${formatNull(c.code_hash)}, \
            status=${formatInt(c.status)}, \
            updated_at=datetime('now'), \
            domain=${formatNull(formatText(c.domain))}
            WHERE id='${c.canister_id}';`,
            (err) => {
              if (err) {
                console.log(err);
                WARNING(`[saveCanisters] -> ${err}`);
              }
            });

          this.db.run(`
            INSERT INTO canisters (id, code_hash, status, domain, updated_at ) \
            SELECT ${values} WHERE NOT EXISTS (SELECT 1 FROM canisters WHERE id='${c.canister_id}');`,
            (err) => {
              if (err) {
                console.log(err);
                WARNING(`[saveCanisters] -> ${err}`);
              }
            });

        } catch (err) {
          console.log(err);
          WARNING(`[saveCanisters] -> ${err}`);
        }
      }

      this.db.run('COMMIT;');

    });
  }

  async findCanister(canister_id) {
    const rows = await this.dbAll(`SELECT * FROM canisters WHERE id = '${canister_id}';`);

    return rows;
  }
}

module.exports = {
  DB,
};
