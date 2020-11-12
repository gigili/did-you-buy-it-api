import express from 'express';

const PORT = process.env.PORT || 3030;
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (parseInt(process.env.DEVELOPMENT || "0") === 1) {
	const logger = require('morgan');
	app.use(logger('dev'));
}

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});

const indexRouter = require('./routes/index');
const listRouter = require('./routes/list');

app.use('/', indexRouter);
app.use('/list', listRouter);

