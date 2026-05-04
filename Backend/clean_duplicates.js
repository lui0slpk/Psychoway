import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "psychoway",
});

db.connect();

const aggressiveCleanup = `
DELETE t1 FROM users t1
INNER JOIN users t2 
WHERE t1.id_user > t2.id_user 
AND t1.document = t2.document;
`;

const aggressiveCleanupEmail = `
DELETE t1 FROM users t1
INNER JOIN users t2 
WHERE t1.id_user > t2.id_user 
AND t1.email = t2.email;
`;

db.query(aggressiveCleanup, (err, results) => {
  if (err) console.error(err);
  else console.log("Deleted duplicate documents:", results.affectedRows);

  db.query(aggressiveCleanupEmail, (err, resultsEmail) => {
    if (err) console.error(err);
    else console.log("Deleted duplicate emails:", resultsEmail.affectedRows);
    db.end();
  });
});
