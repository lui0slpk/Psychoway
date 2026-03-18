import mysql from "mysql2";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "psychoway"
});

db.connect();

const truncateUsersQuery = `
    DELETE FROM users;
`;

db.query(truncateUsersQuery, (err, results) => {
    if (err) {
        console.error("Error truncating users:", err);
    } else {
        console.log("Deleted ALL users:", results.affectedRows);
        
        const resetAutoIncrement = "ALTER TABLE users AUTO_INCREMENT = 1;";
        db.query(resetAutoIncrement, (err, res) => {
           console.log("Reset AUTO_INCREMENT");
           db.end(); 
        });
    }
});
