import mysql from "mysql2";
import fs from "fs";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "psychoway"
});

db.connect();

db.query("SHOW INDEX FROM users", (err, results) => {
    if (err) {
        console.error(err);
    } else {
        const uniqueIndexes = results.filter(row => row.Non_unique === 0);
        fs.writeFileSync("db_indexes.json", JSON.stringify(uniqueIndexes, null, 2));
        console.log("Saved to db_indexes.json");
    }
    db.end();
});
