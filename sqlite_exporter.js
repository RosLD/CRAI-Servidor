import Database from 'better-sqlite3'

let fecha = process.argv[2]

const dbpc = new Database(`sqlite_databases/${fecha}/Raspberry8/${fecha}_PersonCount.db`, options);
