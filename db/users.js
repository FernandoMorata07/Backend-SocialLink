const bcrypt = require('bcrypt');
const { generateError } = require('../helpers');
const { getConnection } = require('./db');

const getUserByEmail = async (email) => {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
      SELECT * FROM users WHERE email=?
      `,
            [email]
        );

        if (result.length === 0) {
            throw generateError('No hay ningun usuario con ese email', 404);
        }

        return result[0];
    } finally {
        if (connection) connection.release();
    }
};

const getUserById = async (id) => {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
      SELECT id, email, nombre, biography FROM users WHERE id=?
      `,
            [id]
        );

        if (result.length === 0) {
            throw generateError('No hay ningun usuario con esa id', 404);
        }

        return result[0];
    } finally {
        if (connection) connection.release();
    }
};

const createUser = async (email, password, nombre) => {
    let connection;
    try {
        connection = await getConnection();
        const [user] = await connection.query(
            `SELECT id FROM users WHERE email = ?
      `,
            [email]
        );
        if (user.length > 0) {
            throw generateError(
                'Ya existe un usuario en la base de datos con ese email',
                409
            );
        }

        const passwordHash = await bcrypt.hash(password, 8);

        const [{ insertId }] = await connection.query(
            `
      INSERT INTO users (email, password, nombre) VALUES (?,?,?)
      `,
            [email, passwordHash, nombre]
        );

        return insertId;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
};
