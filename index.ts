/**
 * Основной модуль приложения - точка входа. 
 */

import express, { Request, Response } from 'express';
import logger from './logger';
import config from './config';
import {noteHandler, dealHandler, dbConnection, dbDisconnecrtion} from './functions'

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/install", dbConnection);

app.get("/ping", (req: Request, res: Response) => res.send('pong ' + Date.now()));

app.get("/uninstall", dbDisconnecrtion);

app.post("/switch", dealHandler)

app.post("/note", noteHandler);

app.listen(config.PORT, () => logger.debug('Server started on ', config.PORT));