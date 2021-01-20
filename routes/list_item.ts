import {Response} from "express";
import {Request} from "../util/types/request";
import {authenticateToken, invalidResponse} from "../util/functions";
import {ApiResponse} from "../util/types";
import {checkSchema, validationResult} from "express-validator";
import {deleteListItemSchema, editListItemSchema, newListItemSchema} from "../util/schemaValidation/listItemSchema";
import {UploadedFile} from "express-fileupload";

const fs = require("fs");
const uploadHelper = require("../util/uploadHelper");
const express = require("express");
const router = express.Router();
const listItemModel = require("../models/ListItemModel");

router.get("/:listID", authenticateToken(), async (req: Request, res: Response) => {
	if (!req.params.listID) {
		return res.status(400).send(invalidResponse("Missing list ID."));
	}

	if (!req.user) {
		return res.status(401).send(invalidResponse("Invalid token."));
	}

	const itemResult = await listItemModel.getListItems(parseInt(req.params.listID));

	if (itemResult.error) {
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
		return res.status(401).send(invalidResponse("Invalid token."));
	}

	let newImageName;

	if (req.files && req.files.image) {
		const image = req.files.image as UploadedFile;
		const validFile = uploadHelper.allowed_file_type(req.files);
		if (!validFile) {
			return res.status(400).send(invalidResponse("Invalid file type"));
		}

		if (!fs.existsSync("./public/images/listItem")) {
			fs.mkdirSync("./public/images/listItem", {recursive: true});
		}

		newImageName = Date.now() + "-" + image.name;
		await image.mv(`./public/images/listItem/${newImageName}`);
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
		return res.status(401).send(invalidResponse("Invalid token."));
	}

	let newImageName;
	if (req.files && req.files.image) {
		const image = req.files.image as UploadedFile;
		const validFile = uploadHelper.allowed_file_type(req.files);
		if (!validFile) {
			return res.status(400).send(invalidResponse("Invalid file type"));
		}

		if (!fs.existsSync("./public/images/listItem")) {
			fs.mkdirSync("./public/images/listItem", {recursive: true});
		}

		newImageName = req.params.itemID + "-" + image.name;
		await image.mv(`./public/images/listItem/${newImageName}`);
	}

	const {name, is_repeating} = req.body;

	const editItemResult = await listItemModel.editListItem(
		parseInt(req.params.listID),
		name,
		is_repeating,
		newImageName,
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
		return res.status(401).send(invalidResponse("Invalid token."));
	}

	const result = await listItemModel.setItemBoughtState(parseInt(req.params.listID), parseInt(req.params.itemID), req.user.id);

	if (result.error) {
		return res.status(result.error.code).send(invalidResponse(result.error.message));
	}

	res.send({
		success: true,
		data: result.data
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
		return res.status(401).send(invalidResponse("Invalid token."));
	}

	const deleteItemResult = await listItemModel.deleteListItem(
		parseInt(req.params.listID),
		parseInt(req.params.itemID),
		req.user.id
	);

	if (deleteItemResult.error) return res.status(deleteItemResult.error.code).send(invalidResponse(deleteItemResult.error.message));

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
		return res.status(401).send(invalidResponse("Invalid token."));
	}

	const listItemImage = await listItemModel.deleteItemImage(
		parseInt(req.params.listID),
		parseInt(req.params.itemID),
		req.user.id
	);

	if (listItemImage.error) return res.status(listItemImage.error.code).send(invalidResponse(listItemImage.error.message));

	res.send({
		success: true
	});
});

module.exports = router;
