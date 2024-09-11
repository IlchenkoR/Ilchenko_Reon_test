export type PriceInfo = {
	field_id: number
	values: Array<{
		value: string
	}>
  }

  export type DealsInfo = {
	id: number,
	price: number
  }

  export type ApiDealResponse = {
	_embedded: {
	  contacts: Array<{
		id: number;
	  }>;
	};
  }
  
  export type ApiContactResponse = {
	custom_fields_values: Array<{
	  field_id: number;
	  values: Array<{
		value: string;
	  }>;
	}>;
  }
  

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


  export type Token = {
	access_token: string;
	refresh_token: string;
  }
  
  export type Filters = {
	[key: string]: string;
  }

  export type CustomFieldValue = {
	value: string;
	enum_id?: number;
  }


  export type CustomField = {
	field_id?: number;
	id?: number;
	values: CustomFieldValue[];
	}