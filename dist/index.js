"use strict";
/**
 * Основной модуль приложения - точка входа.
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
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./types/api"));
const logger_1 = __importDefault(require("./types/logger"));
const config_1 = __importDefault(require("./types/config"));
const calculator_1 = __importDefault(require("./types/calculator"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
api_1.default.getAccessToken().then(() => {
    app.get("/ping", (req, res) => res.send("pong " + Date.now()));
    app.get("/install", (req, res) => {
        console.log(req.body.leads);
        res.send("OK");
    });
    app.post("/switch", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const map = new Map([
                [25661, 20707],
                [25663, 48669],
                [25665, 48671],
                [25667, 48673],
                [25669, 48675]
            ]);
            const services = [];
            if (req.body.leads.update[0].custom_fields[0].id == '48677') {
                req.body.leads.update[0].custom_fields[0].values.forEach((element) => {
                    services.push(Number(element.enum));
                });
            }
            const deal = (yield api_1.default.getDeal(Number(req.body.leads.update[0].id), ["contacts"]))._embedded.contacts[0].id;
            const price = (yield api_1.default.getContact(Number(deal))).custom_fields_values;
            const purchasedServices = {};
            price.forEach((element) => {
                if ([...map.values()].includes(element.field_id)) {
                    purchasedServices[element.field_id] = element.values[0].value;
                }
            });
            const budget = (0, calculator_1.default)(services, purchasedServices, map);
            const updateDeal = [{
                    "id": Number(req.body.leads.update[0].id),
                    "price": budget
                }];
            if (budget !== Number(req.body.leads.update[0].price)) {
                let tasks = yield api_1.default.getTasks(Number(req.body.leads.update[0].id));
                yield api_1.default.updateDeals(updateDeal);
                if (tasks.length === 0) {
                    const a = [
                        {
                            "task_type_id": 3525410,
                            "text": "Проверить бюджет",
                            "complete_till": Math.floor((new Date((new Date()).getTime() + 24 * 60 * 60 * 1000)).getTime() / 1000),
                            "entity_id": Number(req.body.leads.update[0].id),
                            "entity_type": "leads",
                        }
                    ];
                    yield api_1.default.createTask(a);
                }
            }
            res.status(200).send('Ok');
        }
        catch (error) {
            res.status(500).send('Error');
        }
    }));
    app.post("/not", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (req.body.task.update[0].action_close == 1 && req.body.task.update[0].text == 'Проверить бюджет') {
                yield api_1.default.addNote(Number(req.body.task.update[0].element_id));
            }
            res.status(200).send('Ok');
        }
        catch (error) {
            res.status(500).send('Error');
        }
    }));
    app.listen(config_1.default.PORT, () => logger_1.default.debug("Server started on ", config_1.default.PORT));
});
