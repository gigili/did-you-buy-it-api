import * as core from "express-serve-static-core";
import {TokenUser} from "./index";

export interface Request extends core.Request {
	user?: TokenUser;
	lang?: string
}
