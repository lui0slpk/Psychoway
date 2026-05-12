import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "psychoway",
});

db.connect();

const query = `
    SELECT document, COUNT(*) as count 
    FROM users 
    GROUP BY document 
    HAVING count > 1;
`;

const queryEmail = `
    SELECT email, COUNT(*) as count 
    FROM users 
    GROUP BY email 
    HAVING count > 1;
`;

db.query(query, (err, results) => {
  if (err) console.error(err);
  else console.log("Duplicate Documents:", results);

  db.query(queryEmail, (err, resultsEmail) => {
    if (err) console.error(err);
    else console.log("Duplicate Emails:", resultsEmail);
    db.end();
  });
});
