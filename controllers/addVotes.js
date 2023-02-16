/* 
    Controlador para votar enlaces (añadir likes)
*/
const jwt = require('jsonwebtoken');
const { generateError } = require('../helpers');
const { getConnection } = require('../db/db');
const { authUser } = require('../middlewares/auth');
const { getLinkById } = require('../db/links');
const Joi = require('@hapi/joi');

const addVotes = async (req, res, next) => {
    let connection;
    const idAuthUser = req.userId;
    try {
        connection = await getConnection();

        // Destructuramos el id del enlace de los path params
        const { idLink } = req.params;

        // Comprobamos que el enlace que se desea votar exista (con la función correspondiente)

        await getLinkById(idLink);

        // Comprobamos que el usuario NO es lo mismo que ha publicado el enlace
        const [[link]] = await connection.query(
            `SELECT * FROM links WHERE id = ?`,
            [idLink]
        );

        // Si el idUser de la consulta es igual al id del usuario logueado
        if (link.id_user === idAuthUser) {
            throw generateError('No puedes dar likes a tus publicaciones', 409);
        }

        // Comprobamos que este usuario todavía no haya votado este enlace
        const [votos] = await connection.query(
            `SELECT * FROM votos WHERE id_users = ? AND id_links = ?`,
            [idAuthUser, idLink]
        );

        // Si esta consulta devuelve algún valor, es que ya se ha votado ese enlace, error
        if (votos.length > 0) {
            throw generateError('¡Ya has votado ese enlace!', 409); // Conflict
        }

        // Obtenemos el valor del voto del req.body
        const { voto } = req.body;

        //Comprobamos que el voto sea un número entre 1 y 9
        const schema = Joi.number().min(1).max(9).required();

        const validation = schema.validate(voto);

        if (validation.error) {
            throw generateError(validation.error.message, 400);
        }
        //Añadimos el voto
        await connection.query(
            `INSERT INTO votos (id_users, id_links, voto)
            VALUES (?, ?, ?)`,
            [idAuthUser, idLink, voto]
        );

        res.send({
            status: 'Ok',
            message: `¡Tu voto ha sido registrado!`,
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = addVotes;
