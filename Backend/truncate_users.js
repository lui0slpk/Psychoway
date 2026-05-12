import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "psychoway",
});

db.connect();

db.query("SET FOREIGN_KEY_CHECKS = 0;", (err) => {
  if (err) {
    console.error("Error disabling foreign key checks:", err);
    db.end();
    return;
  }

  db.query("DELETE FROM users;", (err, results) => {
    if (err) {
      console.error("Error truncating users:", err);
      db.end();
      return;
    }

    console.log("Deleted ALL users:", results.affectedRows);

    db.query("SET FOREIGN_KEY_CHECKS = 1;", (err) => {
      if (err) {
        console.error("Error re-enabling foreign key checks:", err);
      }

      db.query("ALTER TABLE users AUTO_INCREMENT = 1;", (err, res) => {
        if (err) {
          console.error("Error resetting AUTO_INCREMENT:", err);
        } else {
          console.log("Reset AUTO_INCREMENT");
        }
        db.end();
      });
    });
  });
});
