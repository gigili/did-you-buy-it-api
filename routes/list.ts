import {checkSchema, validationResult} from "express-validator";
import {NextFunction, Response} from "express";
import {listDeleteSchema, listSchema, listUpdateSchema} from "../util/schemaValidation/listSchema";
import {authenticateToken, invalidResponse} from "../util/functions";
import {ApiResponse} from "../util/types";
import {Request} from "../util/types/request";

const express = require("express");
const router = express.Router();
const listModel = require("../models/listModel");

router.get("/:user", (req: Request, res: Response, _: NextFunction) => {
	console.log(req.params);

	res.status(200).send({
		message: 'test'
	});
});

router.post("/", checkSchema(listSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (req.user === undefined) {
		return res.status(401).send(invalidResponse("Invalid token"));
	}

	const result = await listModel.createList(req.body.name, req.user.id);

	if (!result.success) {
		return res.status(400).send(invalidResponse(result.error?.message));
	}

	res.status(201).send({
		success: true
	} as ApiResponse);
});

router.patch("/:listID", checkSchema(listUpdateSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (req.user === undefined) {
		return res.status(401).send(invalidResponse("Invalid token"));
	}

	const result = await listModel.updateList(parseInt(req.params.listID), req.body.name, req.user.id);

	if (!result.success) {
		return res.status(400).send(invalidResponse(result.error?.message));
	}

	res.status(200).send({
		success: true
	} as ApiResponse);
});

router.delete("/:listID", checkSchema(listDeleteSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (req.user === undefined) {
		return res.status(401).send(invalidResponse("Invalid token"));
	}

	const result = await listModel.deleteList(parseInt(req.params.listID), req.user.id);

	if (!result.success) {
		return res.status(400).send(invalidResponse(result.error?.message));
	}

	res.status(200).send({
		success: true
	} as ApiResponse);
});

module.exports = router;
