import {checkSchema, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {generateToken, invalidResponse} from "../util/functions";
import {ApiResponse, TokenData} from "../util/types";
import {loginSchema, registerSchema} from "../util/schemaValidation/indexSchema";
import {connection} from "../app";
import {User} from "../entity/User";

const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const userModel = connection.getRepository(User);

router.get("/", async (req: Request, res: Response, _: NextFunction) => {
	res.send({
		"message": "Welcome",
	});
});

router.post("/login", checkSchema(loginSchema), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	const user = await userModel.findOne({username: req.body.username, password: req.body.password});
	if (!user) {
		return res.status(400).send(invalidResponse("Account doesn't exists"));
	}

	if (user.status !== "1") {
		return res.status(400).send(invalidResponse("Account is not active"));
	}

	const tokenData: TokenData = await generateToken({
		id: user.id,
		username: user.username
	}, true);

	if (tokenData.error) {
		return res.status(500).send(invalidResponse("Login failed"));
	}

	res.send({
		success: true,
		data: {
			user,
			token: tokenData
		},
		error: null
	} as ApiResponse);
});

router.post("/register", checkSchema(registerSchema), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	const activationKey = uuid.v4().slice(0, 14);

	const user = new User();
	user.name = req.body.nackCount;
	user.email = req.body.email;
	user.username = req.body.username;
	user.password = req.body.password;
	user.image = null;
	user.activation_key = activationKey;
	const status = await userModel.save(user);

	console.log(status);

	/*if (registerStatus.error) {
		return res.status(registerStatus.error.code).send(invalidResponse(registerStatus.error.message));
	}*/

	res.send({
		success: true
	} as ApiResponse);
});

router.get("/activate/:email/:activationKey", async (req: Request, res: Response) => {
	if (!req.params.activationKey) {
		return res.render("activate", {
			message: "Invalid activation key",
			type: "error"
		});
	}

	/*const result = await userModel.activate(req.params.email, req.params.activationKey);

	if (result.error) {
		return res.render("activate", {
			message: result.error.message,
			type: "error"
		});
	}*/

	return res.render("activate", {
		message: "Account activated. You can login now.",
		type: "success"
	});
});

module.exports = router;
