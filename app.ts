import express from 'express';
import {getEnvVar} from "./util/functions";
import {EnvVars} from "./util/types";

const PORT = getEnvVar(EnvVars.PORT) || 3030;
const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors')
require('dotenv').config();

app.use(cors({
	"origin": "*",
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 204
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const logger = require('morgan');
app.use(logger('dev'));

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});

const indexRouter = require('./routes/index');
const listRouter = require('./routes/list');

app.use('/', indexRouter);
app.use('/list', listRouter);

