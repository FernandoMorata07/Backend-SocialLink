const {
    insertLink,
    getAllLinks,
    getLinkById,
    deleteLinkById,
} = require('../db/links');

const Joi = require('@hapi/joi');

const { generateError } = require('../helpers');

const newLinkController = async (req, res, next) => {
    console.log('usuario:', req.userId);

    try {
        //VALIDACION CON JOI
        const schema = Joi.object().keys({
            title: Joi.string().min(4).max(100).required(),
            url: Joi.string().required(),
            description: Joi.string().min(5).max(500).required(),
        });

        const validation = schema.validate(req.body);

        if (validation.error) {
            throw generateError(validation.error.message, 400);
        }

        const { title, url, description } = req.body;

        const newLink = { title, url, description, idUser: req.userId };

        const insertId = await insertLink(newLink);

        newLink.id = insertId;

        res.send({
            status: 'OK',
            message: `Nuevo link creado con el id: ${insertId} `,
            data: newLink,
        });
    } catch (error) {
        next(error);
    }
};

const getLinksController = async (req, res, next) => {
    try {
        const links = await getAllLinks();

        res.send({
            status: 'ok',
            data: links,
        });
    } catch (error) {
        next(error);
    }
};

const getSingleLinkController = async (req, res, next) => {
    try {
        //Validación con JOI
        const schema = Joi.number().positive().integer();
        const validation = schema.validate(req.params.id);
        if (validation.error) {
            throw generateError(validation.error.message, 400);
        }

        const { id } = req.params;

        const link = await getLinkById(id);

        res.send({
            status: 'ok',
            data: link,
        });
    } catch (error) {
        next(error);
    }
};

const deleteLinkController = async (req, res, next) => {
    try {
        //req.userId
        const { id } = req.params;

        // Conseguir la información del enlace que quiero borrar
        const link = await getLinkById(id);

        // Comprobar que el usuario del token es el mismo que creó el enlace
        if (req.userId !== link.id_user) {
            throw generateError(
                'Estás intentando borrar un enlace que no es tuyo',
                401
            );
        }

        // Borrar el enlace
        await deleteLinkById(id);

        res.send({
            status: 'ok',
            message: `El link con id: ${id} fue borrado`,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLinksController,
    newLinkController,
    getSingleLinkController,
    deleteLinkController,
};
