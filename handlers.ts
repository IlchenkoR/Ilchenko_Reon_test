import express, { Request, Response } from "express";
import api from './api'
import calculateSum from './calculator'
import { CustomFieldValue, ApiDealResponse, ApiContactResponse, Task, ApiError, DealsInfo, PriceInfo } from './types/interfaces';
import Database from './database'

const dbConnection = async (req: Request, res: Response): Promise<void> => {
    const code = String(req.query.code);
    const ref = String(req.query.referer).split('.')[0];
    const client_id = String(req.query.client_id);

    if (code) {
        const db = Database.getInstance();
        await db.updateAccount(client_id, ref, code, 1);
        res.send("Widget installed");
    }

    api.getAccessToken();
}

const dbDisconnection = async (req: Request, res: Response): Promise<void> => {
    const client_id = String(req.query.client_id);
    const db = Database.getInstance();
    await db.clearAccount(client_id);
    res.send("Widget uninstalled");
}


const dealHandler = async (req: Request, res: Response) : Promise<void> => {

	const [{id: leadsId, custom_fields, price: leadsPrice}] = req.body.leads.update
	const [{ id: fieldId, values }] = custom_fields;
	const leadType = 48677
	const timeSec = 24 * 60 * 60 * 1000

	try{
		const map: Map<string, number[]> = new Map<string, number[]>([
			['firstServiceIds', [25661, 20707]],
			['secondServiceIds', [25663, 48669]], 
			['thirdServiceIds', [25665, 48671]],  
			['fourthServiceIds', [25667, 48673]], 
			['fifthServiceIds', [25669, 48675]]   
		]);
	const services: number[] = [];

	if (Number(fieldId) === leadType){
		values.forEach((element : CustomFieldValue) => {
			services.push(Number(element.value))
		});
	}


	const dealResponse = await api.getDeal(leadsId, ["contacts"]) as ApiDealResponse
	const dealId = dealResponse._embedded.contacts[0].id;

	const contactResponse = await api.getContact(Number(dealId)) as ApiContactResponse
	const price = contactResponse.custom_fields_values;

	const purchasedServices = price.reduce<{[key: string]: number}>((acc, element) => {
		const isFieldIdInMap = Array.from(map.values()).some(idsArray => idsArray.includes(element.field_id));
		if (isFieldIdInMap) {
			acc[element.field_id] = Number(element.values[0].value);
		}
		return acc;
	}, {});

	const budget: number = calculateSum(services, purchasedServices, map)
		
	const updateDeal: DealsInfo[] = [{
		"id": Number(leadsId),
		"price": budget
	}]

	if(budget !== Number(leadsPrice)) {
	const tasks: Task[] = await api.getTasks(Number(leadsId))
	await api.updateDeals(updateDeal)
	if(tasks.length === 0){
		const deadline: number = Math.floor((new Date((new Date()).getTime() + timeSec)).getTime() / 1000)
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
}}

const noteHandler = async (req: Request, res: Response) : Promise<void> => {
	const { task } = req.body;
	const [updatedTask] = task.update;
	const { action_close, text, element_id } = updatedTask;
	const noteText = 'Проверить бюджет'

	try{
		if (Number(action_close) === 1 && text === noteText) {
			await api.addNote(Number(element_id))
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