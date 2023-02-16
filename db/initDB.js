require('dotenv').config();

const { getConnection } = require('./db');

async function main() {
    let connection;

    try {
        connection = await getConnection();

        console.log('Borrando tablas existentes');
        await connection.query('DROP TABLE IF EXISTS votos');
        await connection.query('DROP TABLE IF EXISTS links');
        await connection.query('DROP TABLE IF EXISTS users');

        console.log('Creando tablas');

        await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
         nombre VARCHAR(50) NOT NULL,
        biography VARCHAR(3000)
    );
    `);

        await connection.query(`
    CREATE TABLE IF NOT EXISTS links (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR (1000) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description VARCHAR(5000) NOT NULL,
      id_user INT UNSIGNED NOT NULL,
        FOREIGN KEY (id_user) REFERENCES users (id),
        createdLink DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `);

        await connection.query(`
    CREATE TABLE IF NOT EXISTS votos (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
       voto INT UNSIGNED NOT NULL,
        id_users INT UNSIGNED NOT NULL,
        id_links INT UNSIGNED NOT NULL,
        FOREIGN KEY (id_users) REFERENCES users (id),
        FOREIGN KEY (id_links) REFERENCES links (id)
    );
    
    `);
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

main();
