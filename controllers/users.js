const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateError } = require('../helpers');
const { createUser, getUserById, getUserByEmail } = require('../db/users');
const Joi = require('@hapi/joi');

const newUserController = async (req, res, next) => {
    try {
        //Validación con JOI
        const schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().min(5).max(20).required(),
            nombre: Joi.string().min(3).max(20).required(),
        });

        const validation = schema.validate(req.body);

        if (validation.error) {
            throw generateError(validation.error.message, 400);
        }

        const { email, password, nombre } = req.body;

        const id = await createUser(email, password, nombre);

        res.send({
            status: 'ok',
            message: `User created with id: ${id}`,
        });
    } catch (error) {
        next(error);
    }
};

const getUserController = async (req, res, next) => {
    try {
        //Validación con JOI
        const schema = Joi.number().positive().integer();
        const validation = schema.validate(req.params.id);
        if (validation.error) {
            throw generateError(validation.error.message, 400);
        }

        const { id } = req.params;

        const user = await getUserById(id);

        res.send({
            status: 'ok',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const getMeController = async (req, res, next) => {
    try {
        const user = await getUserById(req.userId, false);

        res.send({
            status: 'ok',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const loginController = async (req, res, next) => {
    try {
        //Validación con JOI
        const schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().min(5).max(20).required(),
        });

        const validation = schema.validate(req.body);

        if (validation.error) {
            throw generateError(validation.error.message, 400);
        }

        const { email, password } = req.body;

        // Recojo los datos de la base de datos del usuario con ese email
        const user = await getUserByEmail(email);

        // Comprueba que las contraseñas coincidan
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw generateError('La contraseña no coincide', 401);
        }

        // Creo el payload del token
        const payload = { id: user.id };

        // Firmo el token
        const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: '30d',
        });

        // Envío el token
        res.send({
            status: 'ok',
            data: token,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    newUserController,
    getUserController,
    loginController,
    getMeController,
};
