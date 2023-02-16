require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const {
    newUserController,
    getUserController,
    loginController,
    getMeController,
} = require('./controllers/users');

const editUser = require('./controllers/editUser');
const editUserPass = require('./controllers/editUserPass');
const addVotes = require('./controllers/addVotes');

const {
    getLinksController,
    newLinkController,
    getSingleLinkController,
    deleteLinkController,
} = require('./controllers/links');
const { authUser } = require('./middlewares/auth');

const app = express();

app.use(cors());

app.use(express.json());
app.use(morgan('dev'));

//Rutas de usuario
app.post('/user', newUserController);
app.get('/user/:id', authUser, getUserController);
app.post('/login', loginController);
app.get('/user', authUser, getMeController);
// Modificar email o username
app.put('/user/edit', editUser);
// Modificar la contraseña del usuario
app.put('/users/password', editUserPass);

//Rutas de Links
app.post('/', authUser, newLinkController);
app.get('/', getLinksController);
app.get('/link/:id', getSingleLinkController);
app.delete('/link/:id', deleteLinkController);

//Rutas de votos
// Votar un enlace
app.post('/votos/:idLink', authUser, addVotes);

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, DELETE'
    );
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Middleware de 404
app.use((req, res) => {
    res.status(404).send({
        status: 'error',
        message: 'Not found',
    });
});

// Middleware de gestión de errores
app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.httpStatus || 500).send({
        status: 'error',
        message: error.message,
    });
});

// Lanzamos el servidor
const puerto = 4000;
app.listen(puerto, () => {
    console.log(`Servidor funcionando perfectamente en el puerto ${puerto} 🤩`);
});
