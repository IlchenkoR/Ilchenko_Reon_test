/**
 * Модуль содержит ключи интеграции и другие конфигурации
 */
type Config = {
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	AUTH_CODE: string;
	REDIRECT_URI: string;
	SUB_DOMAIN: string;
	PORT: number;
  }

const config: Config = {
	// данные для api amocrm
	CLIENT_ID: '0253f711-f651-433e-887d-50166b5ad1e3',
	CLIENT_SECRET: 'gXGfuyl2UkHDpvsksqc8GPoeuUQjXL5Jk01ANiIi1QMhnHujmZi0d95pS6A5UBS5',
	//AUTH_CODE живет 20 минут, при перезапуске скрипта нужно брать новый
	AUTH_CODE: '',
	REDIRECT_URI: 'https://1034-77-95-90-50.ngrok-free.app/install',
	SUB_DOMAIN: '',
	// конфигурация сервера
	PORT: 2000,
}; 

export default config;
