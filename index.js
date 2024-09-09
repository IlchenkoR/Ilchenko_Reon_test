/**
 * Основной модуль приложения - точка входа. 
 */

import express from 'express';
import api from './api'
import logger from './logger';
import config from './config';
import calculateAge from './ageCalculator'
import utils from './utils';

const app = express();

const AGE_FIELD_ID = 20707;
const BIRTHDAY_FIELD_ID = '10543'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api.getAccessToken().then(() => {
	app.get("/ping", (req, res) => res.send("pong " + Date.now()));

	app.post("/install", (req, res) => {
		res.send("OK");
	});


		app.post("/contacts", async (req, res) => {

		try {
			const [contact] = req.body.contacts.add
			const birthDate = contact.custom_fields.find(field => field.id === BIRTHDAY_FIELD_ID).values[0]

			
			if(birthDate){
				const age = utils.makeField(AGE_FIELD_ID, calculateAge(birthDate))

				const updateContact = [
					{"id": Number(contact.id),
					"custom_fields_values": [
						age
					]}
				]
				await api.updateContacts(updateContact)
			}
			res.status(200).send('OK')
		} catch(error) {
			res.status(500).send("Error")
		}
	})

	app.listen(config.PORT, () => logger.debug("Server started on ", config.PORT));
});
