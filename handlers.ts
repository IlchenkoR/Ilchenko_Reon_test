import express, { Request, Response } from "express";
import api from './api'
import calculateSum from './calculator'
import { Note, Task, ApiError, DealsInfo, DealFieldValue } from './types/interfaces';
import Database from './database'
import config from './config';

const noteText = 'Проверить бюджет'

const dbConnection = async (req: Request, res: Response): Promise<void> => {
    const code = String(req.query.code);
    const ref = String(req.query.referer).split('.')[0];
    const client_id = String(req.query.client_id);
	api.setPath(ref)
	api.setCode(code)

	const tokens = await api.getAccessToken();
    if (code) {
        const db = Database.getInstance();
        await db.updateAccount(client_id, tokens.access_token, tokens.refresh_token, ref, 1);
        res.send("Widget installed");
    }
}

const dbDisconnection = async (req: Request, res: Response): Promise<void> => {
    const client_id = String(req.query.client_id);
    const db = Database.getInstance();
    await db.clearAccount(client_id);
    res.send("Widget uninstalled");
}


const dealHandler = async (req: Request, res: Response) : Promise<void>=> {
	const [{id: leadsId, custom_fields, price: leadsPrice}] = req.body.leads.update

	const timeSec = 24 * 60 * 60 * 1000
	const leadType = 48677
	const taskType = 3525410	
	const deadline: number = Math.floor((new Date((new Date()).getTime() + timeSec)).getTime() / 1000)
	const task: Task[] = [
		{
			"task_type_id": taskType,
			"text": noteText,
			"complete_till": deadline,
			"entity_id": Number(leadsId),
			"entity_type": "leads",
		}
	]

	console.log(req.body.leads.update[0])
	const tasks: Task[] = await api.getTasks(Number(leadsId))

	try{
	if(!custom_fields || !custom_fields.length) {
		if(leadsPrice != 0){
			await api.updateDeals([{
				"id": Number(leadsId),
				"price": 0
			}])
			if(tasks.length === 0 || !tasks.some(el => el.text === noteText)){
				await api.createTask(task)
				}
			}
		res.status(200).send('Ok');
		return
	}

	const [{ id: fieldId, values }] = custom_fields;
		const map: Map<string, number[]> = new Map<string, number[]>([
			['firstServiceIds', [25661, 20707]],
			['secondServiceIds', [25663, 48669]], 
			['thirdServiceIds', [25665, 48671]],  
			['fourthServiceIds', [25667, 48673]], 
			['fifthServiceIds', [25669, 48675]]   
		]); 
	const services: number[] = [];

	if (Number(fieldId) === leadType){
		values.forEach((element : DealFieldValue) => {
			services.push(Number(element.enum))
		});
	}


	const dealResponse = await api.getDeal(leadsId, ["contacts"])
	const deal = dealResponse._embedded.contacts[0].id;

	const contactResponse = await api.getContact(Number(deal))
	const price = contactResponse.custom_fields_values;

	const purchasedServices = price.reduce<{[key: string]: number}>((acc, element) => {
		const fieldIdSet = new Set<number>(Array.from(map.values()).flat());
		if (fieldIdSet.has(element.field_id)) {
			acc[element.field_id] = Number(element.values[0].value);
		}
		return acc;
	}, {});

	const budget: number = calculateSum(services, purchasedServices, map)

	console.log(budget)
		
	if(budget !== dealResponse.price) {

		console.log(budget)
		console.log(leadsPrice)

		const updateDeal: DealsInfo[] = [{
			"id": Number(leadsId),
			"price": budget
		}]
	await api.updateDeals(updateDeal)


	if(tasks.length === 0 || !tasks.some(el => el.text === noteText)){
		await api.createTask(task)
		}
	}

	res.status(200).send('Ok')
} catch(error: unknown){
	const axiosError = error as ApiError;
	const statusCode: number = axiosError.response?.status || 500;
	const errorMessage: string = axiosError.response?.data?.message || 'Error'
	res.status(statusCode).send(errorMessage)
}}

const noteHandler = async (req: Request, res: Response) : Promise<void>=> {
	try{
		const { task } = req.body;
		const [updatedTask] = task.update;
		const { action_close, text, element_id } = updatedTask;

		const note: Note[] = [
			{
				"note_type": "common",
				"params":{
					'text': "Бюджет проверен, ошибок нет"
				 }
			}
		]

        if (Number(action_close) === 1 && text === noteText) {
            await api.addNote(Number(element_id), note);
		}
		res.status(200).send('Ok');
	} catch(error){
		res.status(500).send('Error')
	}
	
}


export {noteHandler, 
		dealHandler,
	 	dbConnection,
		dbDisconnection
		};