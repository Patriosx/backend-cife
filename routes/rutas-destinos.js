// rutas-destinos.js
const express = require('express');
const {
  check
} = require('express-validator');

const controladorDestinos = require('../controllers/controlador-destinos');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', controladorDestinos.recuperaDestinos);

router.get('/:did', controladorDestinos.recuperaDestinosPorId);

router.get('/usuarios/:uid', controladorDestinos.recuperaDestinosPorIdUsuario);

router.use(checkAuth);

router.post(
  '/',
  [
    check('nombre').not().isEmpty(),
    check('descripcion').isLength({
      min: 5
    }),
    check('direccion').not().isEmpty()
  ],
  controladorDestinos.crearDestino);

router.patch('/:did', controladorDestinos.modificarDestino);

router.delete('/:did', controladorDestinos.eliminarDestino);

module.exports = router;