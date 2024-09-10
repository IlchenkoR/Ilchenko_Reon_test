/**
 * Основной модуль приложения - точка входа. 
 */

import express, { Request, Response } from "express";
import api from './api'
import logger from './logger';
import config from './config';
import {noteHandler, dealHandler} from './functions'
 
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api.getAccessToken().then(() => {
	app.get("/ping", (req: Request, res: Response) => res.send("pong " + Date.now()));

	app.get("/install", (req: Request, res: Response) => {
		res.status(200).send("Widget installed");
	});

	app.get("/uninstall", (req: Request, res: Response) => {
		res.send("Widget uninstalled");
	});

	app.post("/switch", dealHandler)

	app.post("/note", noteHandler);

	app.listen(config.PORT, () => logger.debug("Server started on ", config.PORT));
});
