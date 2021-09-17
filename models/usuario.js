// usuario.js
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  destinos: [{
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Destino'
  }]
})

usuarioSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Usuario', usuarioSchema);