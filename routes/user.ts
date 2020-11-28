import {Response} from "express";
import {authenticateToken, invalidResponse} from "../util/functions";
import {Request} from "../util/types/request";
import {ApiResponse} from "../util/types";
import {checkSchema, validationResult} from "express-validator";
import {updateUserProfileSchema} from "../util/schemaValidation/userSchema";

const express = require("express");
const router = express.Router();
const userModel = require("../models/UserModel");
const uploadHelper = require("../util/uploadHelper");
const fs = require("fs");

router.get("/", authenticateToken(), async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).send(invalidResponse("Missing token."));
	}

	const user = await userModel.getUser(req.user.id);

	res.send({
		success: true,
		data: user
	} as ApiResponse);
});

router.patch("/", authenticateToken(), checkSchema(updateUserProfileSchema), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(401).send(invalidResponse("Missing token."));
	}

	let newImageName;
	if (req.files && req.files.image) {
		const validFile = uploadHelper.allowed_file_type(req.files);
		if (!validFile) {
			return res.status(400).send(invalidResponse("Invalid file type"));
		}

		if (!fs.existsSync("./public/images/user")) {
			fs.mkdirSync("./public/images/user", {recursive: true});
		}

		newImageName = `${req.user.id}-${req.files.image.name}`;
		await req.files.image.mv(`./public/images/user/${newImageName}`);
	}

	const {name, email} = req.body;
	const result = userModel.update(name, email, req.user.id, newImageName);

	if (result.error) {
		if (newImageName) {
			fs.rmSync(`./public/images/user/${newImageName}`);
		}
		return res.status(result.error.code || 400).send(invalidResponse(result.error.message));
	}

	res.send({
		success: true
	});
});

router.delete("/", authenticateToken(), async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).send(invalidResponse("Missing token."));
	}

	/*const result = await userModel.closeAccount(req.user.id);
	if (result.error) {
		return res.status(result.error.code).send(invalidResponse(result.error.message));
	}*/

	res.send({
		success: true
	});
});

module.exports = router;
