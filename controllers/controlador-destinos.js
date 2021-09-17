// controlador-destinos.js

const { validationResult } = require("express-validator");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const mongoose = require("mongoose");
const Destino = require("../models/destino");
const Usuario = require("../models/usuario");

const recuperaDestinos = async (req, res, next) => {
	destino = await Destino.find();
	console.log(destino);
	try {
		destino = await Destino.find();
	} catch (err) {
		const error = new Error("Ha habido algún error. No se han podido recuperar los datos");
		error.code = 500;
		return next(error);
	}
	if (!destino) {
		const error = new Error("No se ha podido encontrar un destino con el id proporcionado");
		error.code = 404;
		return next(error);
	}
	res.json({
		destino: destino,
	});
};

const recuperaDestinosPorId = async (req, res, next) => {
	const idDestino = req.params.did; // { did = 1 }
	let destino;
	try {
		destino = await Destino.findById(idDestino);
	} catch (err) {
		const error = new Error("Ha habido algún error. No se han podido recuperar los datos");
		error.code = 500;
		return next(error);
	}
	if (!destino) {
		const error = new Error("No se ha podido encontrar un destino con el id proporcionado");
		error.code = 404;
		return next(error);
	}
	res.json({
		nombre: destino,
	});
};

const recuperaDestinosPorIdUsuario = async (req, res, next) => {
	const idUsuario = req.params.uid;
	let destinos;
	try {
		destinos = await Destino.find({
			creador: idUsuario,
		});
	} catch (err) {
		const error = new Error("Ha fallado la recuperación. Inténtelo de nuevo más tarde");
		error.code = 500;
		return next(error);
	}

	if (!destinos || destinos.length === 0) {
		const error = new Error("No se han podido encontrar destinos para el usuario proporcionado");
		error.code = 404;
		return next(error);
	} else {
		res.json({
			destinos,
		});
	}
};

const crearDestino = async (req, res, next) => {
	// const errores = validationResult(req); // Valida en base a las especificaciones en el archivo de rutas para este controller específico
	// if (!errores.isEmpty()) {
	// 	const error = new Error("Error de validación. Compruebe sus datos");
	// 	error.code = 422;
	// 	return next(error);
	// }
	const { nombre, descripcion, localizacion, direccion, creador } = req.body;
	const nuevoDestino = new Destino({
		nombre,
		descripcion,
		localizacion,
		direccion,
		creador,
	});

	let usuario; // Localizamos al usuario que se corresponde con el creador que hemos recibido en el request
	try {
		usuario = await Usuario.findById(creador);
	} catch (error) {
		const err = new Error("Ha fallado la creación del destino");
		err.code = 500;
		return next(err);
	}

	if (!usuario) {
		const error = new Error("No se ha podido encontrar un usuario con el id proporcionado");
		error.code = 404;
		return next(error);
	}
	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await nuevoDestino.save({
			session: sess,
		});
		usuario.destinos.push(nuevoDestino);
		await usuario.save({
			session: sess,
		});
		await sess.commitTransaction();
	} catch (error) {
		const err = new Error("No se han podido guardar los datos");
		err.code = 500;
		return next(err);
	}
	res.status(201).json({
		destino: nuevoDestino,
	});
};

const modificarDestino = async (req, res, next) => {
	const { nombre, descripcion } = req.body;
	const idDestino = req.params.did;
	let destino;
	try {
		destino = await Destino.findById(idDestino);
	} catch (error) {
		const err = new Error("Ha habido algún problema. No se ha podido actualizar la información del destino");
		err.code = 500;
		return next(err);
	}
	// si el creado es distinto al userId que sacamos del check-auth
	if (destino.creador.toString() !== req.userData.userId) {
		const err = new Error("No tiene permiso para modificar este destino");
		err.code = 401; // Error de autorización
		return next(err);
	}

	destino.nombre = nombre;
	destino.descripcion = descripcion;

	try {
		destino.save();
	} catch (error) {
		const err = new Error("Ha habido algún problema. No se ha podido guardar la información actualizada");
		err.code = 500;
		return next(err);
	}

	res.status(200).json({
		destino,
	});
};

const eliminarDestino = async (req, res, next) => {
	const idDestino = req.params.did;
	let destino;
	try {
		destino = await Destino.findById(idDestino).populate("creador");
	} catch (err) {
		const error = new Error("Ha habido algún error. No se han podido recuperar los datos para eliminación");
		error.code = 500;
		return next(error);
	}

	if (!destino) {
		const error = new Error("No se ha podido encontrar un destino con el id proporcionado");
		error.code = 404;
		return next(error);
	}

	if (destino.creador.id !== req.userData.userId) {
		const err = new Error("No tiene permiso para eliminar este destino");
		err.code = 401; // Error de autorización
		return next(err);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await destino.remove({ session: sess });
		//destino: consulta donde guardamos el destino que queremos borrar
		//creador: campo del registro destino
		//destinos es la coleccion
		destino.creador.destinos.pull(destino);
		await destino.creador.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new Error("Ha habido algún error. No se han podido eliminar los datos");
		error.code = 500;
		return next(error);
	}
	res.json({
		message: "Destino eliminado",
	});
};

exports.recuperaDestinosPorId = recuperaDestinosPorId;
exports.recuperaDestinosPorIdUsuario = recuperaDestinosPorIdUsuario;
exports.crearDestino = crearDestino;
exports.recuperaDestinos = recuperaDestinos;
exports.modificarDestino = modificarDestino;
exports.eliminarDestino = eliminarDestino;
