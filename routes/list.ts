import {checkSchema, validationResult} from "express-validator";
import {NextFunction, Response} from "express";
import {listDeleteSchema, listSchema, listUpdateSchema, newListUserSchema} from "../util/schemaValidation/listSchema";
import {authenticateToken, invalidResponse} from "../util/functions";
import {ApiResponse} from "../util/types";
import {Request} from "../util/types/request";

const express = require("express");
const router = express.Router();
const listModel = require("../models/ListModel");


router.get("/:listID", authenticateToken(), async (req: Request, res: Response, _: NextFunction) => {
	if (!req.user) return res.status(401).send(invalidResponse("Missing token."));
	const list = await listModel.getList(parseInt(req.params.listID), req.user.id);

	if (list.error) return res.status(list.error.code).send(invalidResponse(list.error.message));

	res.status(200).send(list);
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

	if (result.error) {
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

	if (result.error) {
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

	if (result.error) {
		return res.status(400).send(invalidResponse(result.error?.message));
	}

	res.status(200).send({
		success: true
	} as ApiResponse);
});

router.get("/:listID/users", authenticateToken(), async (req: Request, res: Response) => {
	if (!req.params.listID) {
		return res.status(400).send(invalidResponse("Missing list ID."));
	}
	if (!req.user) {
		return res.status(400).send(invalidResponse("Invalid token."));
	}

	const result = await listModel.getListUsers(parseInt(req.params.listID), req.user.id);

	if (result.error) {
		return res.status(result.error.code).send(invalidResponse(result.error.message));
	}

	res.send({
		success: true,
		data: result.data
	} as ApiResponse);
});

router.post("/:listID/users", checkSchema(newListUserSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(400).send(invalidResponse("Invalid token."));
	}

	const result = await listModel.addListUser(parseInt(req.params.listID), req.user.id, req.body.userID);

	if (result.error) {
		return res.status(400).send(invalidResponse(result.error.message));
	}

	res.status(201).send({
		success: true
	} as ApiResponse);
});

router.delete("/:listID/users", checkSchema(newListUserSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(400).send(invalidResponse("Invalid token."));
	}

	const result = await listModel.deleteListUser(parseInt(req.params.listID), req.user.id, req.body.userID);

	if (result.error) {
		return res.status(400).send(invalidResponse(result.error.message));
	}

	res.status(201).send({
		success: true
	} as ApiResponse);
});

module.exports = router;
