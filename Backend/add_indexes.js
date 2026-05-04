import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "psychoway",
});

db.connect();

const queries = [
  "ALTER TABLE users ADD UNIQUE (document);",
  "ALTER TABLE users ADD UNIQUE (email);",
];

let completed = 0;

queries.forEach((query) => {
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", query);
      console.error(err);
    } else {
      console.log("Success:", query);
    }

    completed++;
    if (completed === queries.length) {
      db.end();
      console.log("All queries executed.");
    }
  });
});
