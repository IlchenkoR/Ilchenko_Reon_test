/**
 * Модуль содержит ключи интеграции и другие конфигурации
 */
interface Config {
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	AUTH_CODE: string;
	REDIRECT_URI: string;
	SUB_DOMAIN: string;
	PORT: number;
  }

const config: Config = {
	// данные для api amocrm
	CLIENT_ID: "070f6f4c-012a-4abc-9b36-792f50390db2",
	CLIENT_SECRET: "muUwIJydbyWOIqQgwUCtCVsrySGM5b7cPidf481iNZaW14ZLisbMtC2f9pqo4FTE",
	//AUTH_CODE живет 20 минут, при перезапуске скрипта нужно брать новый
	AUTH_CODE: "",
	REDIRECT_URI: "https://ece9-77-95-90-50.ngrok-free.app/install",
	SUB_DOMAIN: "rilchenko",
	// конфигурация сервера
	PORT: 2000,
}; 

export default config;
