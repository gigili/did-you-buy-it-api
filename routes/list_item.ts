import {Response} from "express";
import {Request} from "../util/types/request";
import {authenticateToken, invalidResponse} from "../util/functions";
import {ApiResponse} from "../util/types";
import {checkSchema, validationResult} from "express-validator";
import {deleteListItemSchema, editListItemSchema, newListItemSchema} from "../util/schemaValidation/listItemSchema";
import {TABLES, updateDbRecord} from "../util/db";

const fs = require("fs");
const uploadHelper = require("../util/uploadHelper");
const express = require("express");
const router = express.Router();
const listItemModel = require("../models/ListItemModel");

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

	let newImageName;
	if (req.files && req.files.image) {
		const validFile = uploadHelper.allowed_file_type(req.files);
		if (!validFile) {
			return res.status(400).send(invalidResponse("Invalid file type"));
		}

		if (!fs.existsSync("./public/images/listItem")) {
			fs.mkdirSync("./public/images/listItem", {recursive: true});
		}

		newImageName = Date.now() + "-" + req.files.image.name;
		await req.files.image.mv(`./public/images/listItem/${newImageName}`);
	}

	const {name, is_repeating} = req.body;

	const newItemResult = await listItemModel.addListItem(parseInt(req.params.listID), name, is_repeating, req.user.id, newImageName);

	if (newItemResult.error) {
		if (newImageName) {
			fs.rmSync(`./public/images/listItem/${newImageName}`);
		}
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

router.patch("/:listID/:itemID/bought", authenticateToken(), async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(400).send(invalidResponse("Missing token."));
	}

	const result = await listItemModel.setItemBoughtStatus(parseInt(req.params.listID), parseInt(req.params.itemID), req.user.id);

	if (result.error) {
		return res.status(result.error.code).send(invalidResponse(result.error.message));
	}

	await listItemModel.sendBoughtNotification(parseInt(req.params.listID), parseInt(req.params.itemID), req.user.id, "android");

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

	const listItemImage = await listItemModel.getImage(
		parseInt(req.params.listID),
		parseInt(req.params.itemID),
		req.user.id
	);

	const deleteItemResult = await listItemModel.deleteListItem(
		parseInt(req.params.listID),
		parseInt(req.params.itemID),
		req.user.id
	);

	if (deleteItemResult.error) {
		return res.status(deleteItemResult.error.code || 400).send(invalidResponse(deleteItemResult.error.message));
	} else {
		if (!listItemImage.error) {
			if (listItemImage.data.image) {
				fs.rmSync(`./public/images/listItem/${listItemImage.data.image}`);
			}
		}
	}

	res.send({
		success: true
	} as ApiResponse);
});

router.delete("/:listID/:itemID/image", checkSchema(deleteListItemSchema), authenticateToken(), async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = errors.array()[0];
		const {msg, param} = error;
		return res.status(400).json(invalidResponse(msg, param));
	}

	if (!req.user) {
		return res.status(400).send(invalidResponse("Missing token."));
	}

	const listItemImage = await listItemModel.getImage(
		parseInt(req.params.listID),
		parseInt(req.params.itemID),
		req.user.id
	);

	if (!listItemImage.error) {
		if (listItemImage.data.image) {
			fs.rmSync(`./public/images/listItem/${listItemImage.data.image}`);
			const status = await updateDbRecord(TABLES.ListItems, {image: null}, `id = ${req.params.itemID}`);

			if (status.error) {
				return res.status(status.error.code).send(invalidResponse(status.error.message));
			} else {
				return res.send({
					success: true,
				} as ApiResponse);
			}
		}
	} else {
		res.status(400).send(invalidResponse("Unable to delete the selected image."));
	}
});

module.exports = router;
