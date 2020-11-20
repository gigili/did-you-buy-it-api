const dotenv = require("dotenv").config();

import express from "express";
import {getEnvVar} from "./util/functions";
import {EnvVars} from "./util/types";

const PORT = getEnvVar(EnvVars.PORT) || 3030;
const app = express();

const fileUpload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors({
	"origin": "*",
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 204
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(fileUpload({
	limits: {fileSize: 50 * 1024 * 1024}, //5MB
	useTempFiles: true,
	tempFileDir: "/tmp/",
	safeFileNames: true,
	preserveExtension: true,
	abortOnLimit: true,
	responseOnLimit: "File size can't be bigger than 5MB."
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const logger = require("morgan");
app.use(logger("dev"));

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});

const indexRouter = require("./routes/index");
const listRouter = require("./routes/list");
const listItemRouter = require("./routes/list_item");
const userRouter = require("./routes/user");

app.use("/", indexRouter);
app.use("/list", listRouter);
app.use("/list/item", listItemRouter);
app.use("/user", userRouter);

