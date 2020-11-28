import {checkSchema, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {invalidResponse} from "../util/functions";
import {ApiResponse} from "../util/types";
import {loginSchema, registerSchema} from "../util/schemaValidation/indexSchema";

const express = require("express");
const router = express.Router();

const userModel = require("../models/UserModel");

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

	const loginResult = await userModel.login(req.body.username, req.body.password);

	if (loginResult.error !== undefined) {
		return res.status(loginResult.error.code).send(invalidResponse(loginResult.error.message));
	}

	res.send({
		success: true,
		data: loginResult.data,
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

	const registerStatus = await userModel.register(req.body);

	if (registerStatus.error) {
		return res.status(registerStatus.error.code).send(invalidResponse(registerStatus.error.message));
	}

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

	const result = await userModel.activate(req.params.email, req.params.activationKey);

	if (result.error) {
		return res.render("activate", {
			message: result.error.message,
			type: "error"
		});
	}

	return res.render("activate", {
		message: "Account activated. You can login now.",
		type: "success"
	});
});

module.exports = router;
