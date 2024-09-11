import express, { Request, Response } from 'express';
import api from './api'
import calculateSum from './calculator'
import { ApiDealResponse, ApiContactResponse, Task, ApiError, DealsInfo, PriceInfo, DealFieldValue } from './types/interfaces';


const dealHandler = async (req: Request, res: Response) : Promise<void>=> {

	const [{id: leadsId, custom_fields, price: leadsPrice}] = req.body.leads.update
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
		values.forEach((element : DealFieldValue) => {
			services.push(Number(element.enum))
		});
	}


	const dealResponse: ApiDealResponse = await api.getDeal(leadsId, ["contacts"]) as ApiDealResponse
	const deal = dealResponse._embedded.contacts[0].id;

	const contactResponse: ApiContactResponse = await api.getContact(Number(deal)) as ApiContactResponse
	const price = contactResponse.custom_fields_values;

	const purchasedServices: {[key: number]: string} = {}

	price.forEach((element: PriceInfo) => {
		if([...map.values()].includes(element.field_id)){
			purchasedServices[element.field_id] = element.values[0].value
		}
	});

	const budget: number = calculateSum(services, purchasedServices, map)
		
	const updateDeal: DealsInfo[] = [{
		"id": Number(leadsId),
		"price": budget
	}]

	if(budget !== Number(leadsPrice)) {
	const tasks: Task[] = await api.getTasks(Number(leadsId))
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
}}


const noteHandler = async (req: Request, res: Response) : Promise<void>=> {
	try{
		const { task } = req.body;
		const [updatedTask] = task.update;
		const { action_close, text, element_id } = updatedTask;

        if (action_close == 1 && text == 'Проверить бюджет') {
            await api.addNote(Number(element_id));
		}
		res.status(200).send('Ok');
	} catch(error){
		res.status(500).send('Error')
	}
	
}

export {noteHandler, dealHandler};
