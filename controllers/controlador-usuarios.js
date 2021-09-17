// controlador-usuarios.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

const recuperarUsuarios = async (req, res, next) => {
	let usuarios;
	try {
		usuarios = await Usuario.find({}, "-password");
	} catch (err) {
		const error = new Error("Ha ocurrido un error en la recuperación de datos");
		error.code = 500;
		return next(error);
	}
	res.status(200).json({
		usuarios: usuarios,
	});
};

const altaUsuario = async (req, res, next) => {
	const errores = validationResult(req); // Valida en base a las especificaciones en el archivo de rutas para este controller específico
	if (!errores.isEmpty()) {
		const error = new Error("Error de validación. Compruebe sus datos");
		error.code = 422;
		throw error;
	}
	const { nombre, email, password } = req.body;
	let existeUsuario;
	try {
		existeUsuario = await Usuario.findOne({ email: email });
	} catch (err) {
		const error = new Error(err);
		error.code = 500;
		return next(error);
	}

	if (existeUsuario) {
		const error = new Error("Ya existe un usuario con ese e-mail.");
		error.code = 401; // 401: fallo de autenticación
		return next(error);
	} else {
		// Hashing password
		let hashedPassword;
		try {
			hashedPassword = await bcrypt.hash(password, 12);
		} catch (error) {
			const err = new Error("No se ha podido crear el usuario. Inténtelo de nuevo");
			err.code = 500;
			return next(err);
		}
		const nuevoUsuario = new Usuario({
			nombre,
			email,
			password: hashedPassword,
			destinos: [],
		});
		try {
			await nuevoUsuario.save();
		} catch (error) {
			const err = new Error("No se han podido guardar los datos");
			err.code = 500;
			return next(err);
		}

		let token;
		try {
			token = jwt.sign(
				{
					userId: nuevoUsuario.id,
					email: nuevoUsuario.email,
				},
				process.env.JWT_KEY,
				{
					expiresIn: "1h",
				}
			);
		} catch (error) {
			const err = new Error("El proceso de alta ha fallado");
			err.code = 500;
			return next(err);
		}

		res.status(201).json({
			userId: nuevoUsuario.id,
			email: nuevoUsuario.email,
			token: token,
		});
	}
};

const loginUsuario = async (req, res, next) => {
	const { email, password } = req.body;
	let usuarioExiste;
	try {
		usuarioExiste = await Usuario.findOne({ email: email });
	} catch (error) {
		const err = new Error("No se ha podido realizar la operación. Pruebe más tarde");
		err.code = 500;
		return next(err);
	}
	if (!usuarioExiste) {
		const error = new Error("No se ha podido identificar al usuario. Credenciales erróneos");
		error.code = 422; // 422: Datos de usuario inválidos
		return next(error);
	}
	let esValidoElPassword = false;
	try {
		esValidoElPassword = await bcrypt.compare(password, usuarioExiste.password);
	} catch (error) {
		const err = new Error("No se ha realizar el login. Revise sus credenciales");
		err.code = 500;
		return next(err);
	}
	if (!esValidoElPassword) {
		const error = new Error("No se ha podido identificar al usuario. Credenciales erróneos");
		error.code = 401; // 401: Fallo de autenticación
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: usuarioExiste.id,
				email: usuarioExiste.email,
			},
			process.env.JWT_KEY,
			{
				expiresIn: "1h",
			}
		);
	} catch (error) {
		const err = new Error("El proceso de login ha fallado");
		err.code = 500;
		return next(err);
	}

	res.json({
		userId: usuarioExiste.id,
		email: usuarioExiste.email,
		token: token,
	});
};

exports.recuperarUsuarios = recuperarUsuarios;
exports.altaUsuario = altaUsuario;
exports.loginUsuario = loginUsuario;
