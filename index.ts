/**
 * Основной модуль приложения - точка входа. 
 */

import express, { Request, Response } from "express";
import api from './types/api'
import logger from './types/logger';
import config from './types/config';
import calculateSum from './types/calculator'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type CustomFieldValue = {
    enum: string;
}

type CustomField = {
    id: string;
    values: CustomFieldValue[];
}

api.getAccessToken().then(() => {
	app.get("/ping", (req: Request, res: Response) => res.send("pong " + Date.now()));

	app.get("/install", (req: Request, res: Response) => {
		console.log(req.body.leads);
		res.send("OK");
	});

	app.post("/switch",async (req: Request, res: Response) => {

		try{
			const map: Map<number, number> = new Map<number, number>([
			[25661, 20707],
			[25663, 48669],
			[25665, 48671],
			[25667, 48673],
			[25669, 48675]
		]); 
		const services: number[] = [];

		if (req.body.leads.update[0].custom_fields[0].id == '48677'){
			req.body.leads.update[0].custom_fields[0].values.forEach((element : CustomFieldValue) => {
				services.push(Number(element.enum))
			});
		}


		const deal: [] = (await api.getDeal(Number(req.body.leads.update[0].id), ["contacts"]) as any)._embedded.contacts[0].id

		const price: [] = (await api.getContact(Number(deal)) as any).custom_fields_values

		const purchasedServices: {[key: string]: string} = {}

		price.forEach((element: any) => {
			if([...map.values()].includes(element.field_id)){
				purchasedServices[element.field_id] = element.values[0].value
			}
		});

		const budget: number = calculateSum(services, purchasedServices, map)

		const updateDeal: any[] = [{
			"id": Number(req.body.leads.update[0].id),
			"price": budget
		}]

		if(budget !== Number(req.body.leads.update[0].price)) {
		let tasks: any[] = await api.getTasks(Number(req.body.leads.update[0].id))
		await api.updateDeals(updateDeal)
		if(tasks.length === 0){
			const a: any[] = [
				{
					"task_type_id": 3525410,
					"text": "Проверить бюджет",
					"complete_till": Math.floor((new Date((new Date()).getTime() + 24 * 60 * 60 * 1000)).getTime() / 1000),
					"entity_id": Number(req.body.leads.update[0].id),
					"entity_type": "leads",
				}
			]

			await api.createTask(a)
			}

		}
	
		res.status(200).send('Ok')
	} catch(error){
		res.status(500).send('Error')
	}
	})

	app.post("/not",async (req: Request, res: Response) => {
		try{
			if(req.body.task.update[0].action_close == 1 && req.body.task.update[0].text == 'Проверить бюджет'){
				await api.addNote(Number(req.body.task.update[0].element_id))
			}
			res.status(200).send('Ok');
		} catch(error){
			res.status(500).send('Error')
		}
		
	});

	app.listen(config.PORT, () => logger.debug("Server started on ", config.PORT));
});
