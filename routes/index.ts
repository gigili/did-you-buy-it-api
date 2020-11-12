import {body, validationResult} from "express-validator";

export {};
import {NextFunction, Request, Response} from "express";

const express = require("express");
const router = express.Router();

const userModel = require("../models/userModel");

router.get("/", async (req: Request, res: Response, _: NextFunction) => {
	res.send({
		"message": "Welcome",
	});
});

router.post("/login", [
	body('username').isString().isLength({min: 3}),
	body('password').isLength({min: 10})
], async (req: Request, res: Response, _: NextFunction) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const loginResult = await userModel.login(req.body.username, req.body.password);

	res
		.status(loginResult === false ? 400 : 200)
		.send({loginResult});
});

module.exports = router;
