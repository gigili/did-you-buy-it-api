import {Response} from "express";
import {Request} from "../util/types/request";
import {authenticateToken, invalidResponse} from "../util/functions";
import {ApiResponse} from "../util/types";
import {checkSchema, validationResult} from "express-validator";
import {deleteListItemSchema, editListItemSchema, newListItemSchema} from "../util/schemaValidation/listItemSchema";

const express = require("express");
const router = express.Router();
const listItemModel = require("../models/listItemModel");

router.get("/:listID", authenticateToken(), async (req: Request, res: Response) => {
	if (!req.params.listID) {
		return res.status(400).send(invalidResponse("Missing list ID."));
	}

	const itemResult = await listItemModel.getListItems(parseInt(req.params.listID));

	if (!itemResult.error) {
		return res.status(400).send(invalidResponse(itemResult.error.message));
	}

	res.send({
		success: true,
		data: itemResult.data
	} as ApiResponse);
});

router.post("/:listID", checkSchema(newListItemSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(400).send(invalidResponse("Missing token."));
	}

	const {name, is_repeating} = req.body;

	const newItemResult = await listItemModel.addListItem(parseInt(req.params.listID), name, is_repeating, req.user.id);

	if (newItemResult.error) {
		return res.status(newItemResult.error.code || 400).send(invalidResponse(newItemResult.error.message));
	}

	res.status(201).send({
		success: true
	} as ApiResponse);
});

router.patch("/:listID/:itemID", checkSchema(editListItemSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(400).send(invalidResponse("Missing token."));
	}

	const {name, is_repeating} = req.body;

	const editItemResult = await listItemModel.editListItem(
		parseInt(req.params.listID),
		name,
		is_repeating,
		req.user.id,
		parseInt(req.params.itemID)
	);

	if (editItemResult.error) {
		return res.status(editItemResult.error.code || 400).send(invalidResponse(editItemResult.error.message));
	}

	res.send({
		success: true
	} as ApiResponse);
});

router.delete("/:listID/:itemID", checkSchema(deleteListItemSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(400).send(invalidResponse("Missing token."));
	}

	const deleteItemResult = await listItemModel.deleteListItem(
		parseInt(req.params.listID),
		parseInt(req.params.itemID),
		req.user.id
	);

	if (deleteItemResult.error) {
		return res.status(deleteItemResult.error.code || 400).send(invalidResponse(deleteItemResult.error.message));
	}

	res.send({
		success: true
	} as ApiResponse);
});

module.exports = router;
