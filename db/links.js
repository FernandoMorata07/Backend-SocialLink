const { generateError } = require('../helpers');
const { getConnection } = require('./db');

const insertLink = async (link) => {
    let connection;
    try {
        connection = await getConnection();

        const { title, url, description, idUser } = link;

        const [{ insertId }] = await connection.query(
            `INSERT INTO links (title, url, description, id_user) VALUES (?,?,?,?)`,
            [title, url, description, idUser]
        );
        return insertId;
    } finally {
        if (connection) connection.release();
    }
};

const getAllLinks = async () => {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(`
        SELECT l.*, AVG(v.voto) avgVotos FROM links l LEFT JOIN votos v ON l.id = v.id_links GROUP BY l.id  ORDER BY createdLink DESC
      `);

        return result;
    } finally {
        if (connection) connection.release();
    }
};

const getLinkById = async (id) => {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
        SELECT * FROM links WHERE id = ?
      `,
            [id]
        );

        if (result.length === 0) {
            throw generateError(`El link con id: ${id} no existe`, 404);
        }

        return result[0];
    } finally {
        if (connection) connection.release();
    }
};

const deleteLinkById = async (id) => {
    let connection;

    try {
        connection = await getConnection();

        await connection.query(
            `
        DELETE FROM links WHERE id = ?
      `,
            [id]
        );

        return;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { insertLink, getAllLinks, getLinkById, deleteLinkById };
