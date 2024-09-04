"use strict";
/**
 * Модуль для работы c API amoCRM
 * Модуль используется для работы в NodeJS.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Модуль для работы c API amoCRM
 * Модуль используется для работы в NodeJS.
 */
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const fs_1 = __importDefault(require("fs"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
(0, axios_retry_1.default)(axios_1.default, { retries: 3, retryDelay: axios_retry_1.default.exponentialDelay });
const AMO_TOKEN_PATH = "amo_token.json";
const LIMIT = 200;
class Api {
    constructor() {
        this.access_token = null;
        this.refresh_token = null;
        this.ROOT_PATH = `https://${config_1.default.SUB_DOMAIN}.amocrm.ru`;
        this.authChecker = (request) => {
            return (...args) => {
                if (!this.access_token) {
                    return this.getAccessToken().then(() => this.authChecker(request)(...args));
                }
                return request(...args).catch((err) => {
                    logger_1.default.error(err.response);
                    logger_1.default.error(err);
                    logger_1.default.error(err.response.data);
                    const data = err.response.data;
                    if ("validation-errors" in data) {
                        data["validation-errors"].forEach(({ errors }) => logger_1.default.error(errors));
                        logger_1.default.error("args", JSON.stringify(args, null, 2));
                    }
                    if (data.status === 401 && data.title === "Unauthorized") {
                        logger_1.default.debug("Нужно обновить токен");
                        return this.refreshToken().then(() => this.authChecker(request)(...args));
                    }
                    throw err;
                });
            };
        };
        this.requestAccessToken = () => {
            return axios_1.default
                .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config_1.default.CLIENT_ID,
                client_secret: config_1.default.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: config_1.default.AUTH_CODE,
                redirect_uri: config_1.default.REDIRECT_URI,
            })
                .then((res) => {
                logger_1.default.debug("Свежий токен получен");
                return res.data;
            })
                .catch((err) => {
                logger_1.default.error(err.response.data);
                throw err;
            });
        };
        // Получить сделку по id
        this.getDeal = this.authChecker((id, withParam = []) => {
            return axios_1.default
                .get(`${this.ROOT_PATH}/api/v4/leads/${id}?${querystring_1.default.encode({
                with: withParam.join(","),
            })}`, {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            })
                .then((res) => res.data);
        });
        // Получить сделки по фильтрам
        this.getDeals = this.authChecker(({ page = 1, limit = LIMIT, filters }) => {
            const url = `${this.ROOT_PATH}/api/v4/leads?${querystring_1.default.stringify(Object.assign({ page,
                limit, with: ["contacts"] }, filters))}`;
            console.log(url);
            return axios_1.default
                .get(url, {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            })
                .then((res) => {
                return res.data ? res.data._embedded.leads : [];
            });
        });
        // Обновить сделки
        this.updateDeals = this.authChecker((data) => {
            return axios_1.default.patch(`${this.ROOT_PATH}/api/v4/leads`, [].concat(data), {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            });
        });
        // Получить контакт по id
        this.getContact = this.authChecker((id) => {
            return axios_1.default
                .get(`${this.ROOT_PATH}/api/v4/contacts/${id}?${querystring_1.default.stringify({
                with: ["leads"]
            })}`, {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            })
                .then((res) => res.data);
        });
        // Обновить контакты
        this.updateContacts = this.authChecker((data) => {
            return axios_1.default.patch(`${this.ROOT_PATH}/api/v4/contacts`, [].concat(data), {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            });
        });
        //Вывод задач
        this.createTask = this.authChecker((data) => {
            return axios_1.default.post(`${this.ROOT_PATH}/api/v4/tasks`, [].concat(data), {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            });
        });
        //Получение задач
        this.getTasks = this.authChecker((entity) => {
            return axios_1.default
                .get(`${this.ROOT_PATH}/api/v4/tasks?filter[task_type][]=3525410&filter[is_completed]=0&filter[entity_id][]=${entity}`, {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            })
                .then((res) => {
                if (res.data && res.data._embedded && Array.isArray(res.data._embedded.tasks)) {
                    return res.data._embedded.tasks;
                }
                else {
                    return [];
                }
            })
                .catch((error) => {
                logger_1.default.error("Ошибка при получении задач:", error);
                throw error;
            });
        });
        // Добавление примечания
        this.addNote = this.authChecker((entity_id) => {
            return axios_1.default.post(`${this.ROOT_PATH}/api/v4/leads/${entity_id}/notes`, [
                {
                    "note_type": "common",
                    "params": {
                        "text": "Бюджет проверен, ошибок нет"
                    }
                }
            ], {
                headers: {
                    Authorization: `Bearer ${this.access_token}`,
                },
            });
        });
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.access_token) {
                return Promise.resolve(this.access_token);
            }
            try {
                const content = fs_1.default.readFileSync(AMO_TOKEN_PATH, 'utf-8');
                const token = JSON.parse(content);
                this.access_token = token.access_token;
                this.refresh_token = token.refresh_token;
                return Promise.resolve(token);
            }
            catch (error) {
                logger_1.default.error(`Ошибка при чтении файла ${AMO_TOKEN_PATH}`, error);
                logger_1.default.debug("Попытка заново получить токен");
                const token = yield this.requestAccessToken();
                fs_1.default.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
                this.access_token = token.access_token;
                this.refresh_token = token.refresh_token;
                return Promise.resolve(token);
            }
        });
    }
    ;
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config_1.default.CLIENT_ID,
                client_secret: config_1.default.CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: this.refresh_token,
                redirect_uri: config_1.default.REDIRECT_URI,
            })
                .then((res) => {
                logger_1.default.debug("Токен успешно обновлен");
                const token = res.data;
                fs_1.default.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
                this.access_token = token.access_token;
                this.refresh_token = token.refresh_token;
                return token;
            })
                .catch((err) => {
                logger_1.default.error("Не удалось обновить токен");
                logger_1.default.error(err.response.data);
            });
        });
    }
    ;
}
exports.default = new Api();
