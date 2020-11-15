import {checkSchema, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {invalidResponse, sendEmail} from "../util/functions";
import {ApiResponse} from "../util/types";
import {loginSchema, registerSchema} from "../util/schemaValidation/indexSchema";

const express = require("express");
const router = express.Router();

const userModel = require("../models/userModel");

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

router.get("/test", async (req: Request, res: Response) => {
	const status = await sendEmail(
		"mr.gigiliIII@gmail.com",
		"Test HTML email",
		{
			file: "default",
			data: {
				emailTitle: "Confirm your email address",
				emailPreview: "Click the link in the message to confirm your email address and active your account",
				emailBody: `Here is the link to confirm your email address: <a href='#'>Google.com</a>`
			}
		});

	res.send({
		success: true,
		status
	});
});

module.exports = router;
