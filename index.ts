/**
 * Основной модуль приложения - точка входа. 
 */

import express, { Request, Response } from "express";
import api from './types/api'
import logger from './types/logger';
import config from './types/config';
import calculateSum from './types/calculator'
import { CustomFieldValue, ApiDealResponse, ApiContactResponse, Task, ApiError } from './types/interface';
import { MongoClient, Db, Collection, Document } from 'mongodb'

const app = express();
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/install", async (req: Request, res: Response) => {
	const code  = String(req.query.code)
	const ref = String(req.query.referer).split('.')[0]
	const client_id = String(req.query.client_id)
	res.send("Widget installed")
	if(code){
		config.AUTH_CODE = code
		config.SUB_DOMAIN = ref
		config.CLIENT_ID = client_id
		try {
			await client.connect();
			console.log('Connected to MongoDB');
		
			const database: Db = client.db('Widget');
			const collection: Collection<Document> = database.collection('acc');
		
			const result = await collection.updateOne(
				{_id: client_id as any},
				{ $set: {ref: ref, code: code, stat: 1}},
				{upsert: true}
			  );
			
		  } catch (err) {
			console.error(err);
		  } finally {
			await client.close();
		  }
		}
	api.getAccessToken()
});

app.get("/ping", (req: Request, res: Response) => res.send("pong " + Date.now()));

app.get("/uninstall", async (req: Request, res: Response) => {
	try {
		await client.connect();
		console.log('Connected to MongoDB');
	
		const database: Db = client.db('Widget');
		const collection: Collection<Document> = database.collection('acc');
	
		const result = await collection.updateOne(
			{_id: config.CLIENT_ID as any},
			{ $set: {code: "", stat: 0}}
		  );
	  } catch (err) {
		console.error(err);
	  } finally {
		await client.close();
	  }
	res.send("Widget uninstalled")
});

app.post("/switch",async (req: Request, res: Response) => {

	const {id: leadsId, custom_fields, price: leadsPrice} = req.body.leads.update[0] 
	const [{ id: fieldId, values }] = custom_fields;

	try{
		const map: Map<number, number> = new Map<number, number>([
		[25661, 20707],
		[25663, 48669],
		[25665, 48671],
		[25667, 48673],
		[25669, 48675]
	]); 
	const services: number[] = [];

	if (fieldId == '48677'){
		values.forEach((element : CustomFieldValue) => {
			services.push(Number(element.enum))
		});
	}


	const dealResponse: ApiDealResponse = await api.getDeal(Number(leadsId), ["contacts"]) as ApiDealResponse
	const deal = dealResponse._embedded.contacts[0].id;

	const contactResponse: ApiContactResponse = await api.getContact(Number(deal)) as ApiContactResponse
	const price = contactResponse.custom_fields_values;

	const purchasedServices: {[key: number]: string} = {}

	price.forEach((element: any) => {
		if([...map.values()].includes(element.field_id)){
			purchasedServices[element.field_id] = element.values[0].value
		}
	});

	const budget: number = calculateSum(services, purchasedServices, map)
			
	const updateDeal: any[] = [{
		"id": Number(leadsId),
		"price": budget
	}]

	if(budget !== Number(leadsPrice)) {
	let tasks: Task[] = await api.getTasks(Number(leadsId))
	await api.updateDeals(updateDeal)
	if(tasks.length === 0){
		const deadline: number = Math.floor((new Date((new Date()).getTime() + 24 * 60 * 60 * 1000)).getTime() / 1000)
		const task: Task[] = [
			{
				"task_type_id": 3525410,
				"text": "Проверить бюджет",
				"complete_till": deadline,
				"entity_id": Number(leadsId),
				"entity_type": "leads",
			}
		]

		await api.createTask(task)
		}

	}
	
	res.status(200).send('Ok')
	} catch(error: unknown){
		const axiosError = error as ApiError;
		const statusCode: number = axiosError.response?.status || 500;
    	const errorMessage: string = axiosError.response?.data?.message || 'Error'
		res.status(statusCode).send(errorMessage)
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