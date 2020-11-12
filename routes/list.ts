export {};
import {NextFunction, Request, Response} from "express";

const express = require("express");
const router = express.Router();

router.get("/:user", function (req: Request, res: Response, _: NextFunction) {
	console.log(req.params);

	res.status(200).send({
		message: 'test'
	});
});

module.exports = router;
