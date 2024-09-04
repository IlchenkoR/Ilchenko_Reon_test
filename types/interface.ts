export type CustomFieldValue = {
	enum: string;
  }
  
  // Определите тип для ответа от API getDeal
  export type ApiDealResponse = {
	_embedded: {
	  contacts: Array<{
		id: number;
	  }>;
	};
  }
  
  // Определите тип для ответа от API getContact
  export type ApiContactResponse = {
	custom_fields_values: Array<{
	  field_id: number;
	  values: Array<{
		value: string;
	  }>;
	}>;
  }
  
  // Определите тип для задачи
  export type Task = {
	task_type_id: number;
	text: string;
	complete_till: number;
	entity_id: number;
	entity_type: string;
  }

  export type ApiError = {
	response?: {
	  status: number;
	  data?: {
		message?: string;
	  };
	};
  }