const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const destinoSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  localizacion: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  direccion: {
    type: String,
    required: true
  },
  creador: {
    // type: String,
    // required: true
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Usuario'
  }
})

module.exports = mongoose.model('Destino', destinoSchema);