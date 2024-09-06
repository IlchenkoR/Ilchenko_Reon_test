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
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
const uri = 'mongodb://localhost:27017';
const client = new mongodb_1.MongoClient(uri);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/install", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = String(req.query.code);
    const ref = String(req.query.referer).split('.')[0];
    const client_id = String(req.query.client_id);
    res.send("Widget installed");
    if (code) {
        config_1.default.AUTH_CODE = code;
        config_1.default.SUB_DOMAIN = ref;
        config_1.default.CLIENT_ID = client_id;
        try {
            yield client.connect();
            console.log('Connected to MongoDB');
            const database = client.db('Widget');
            const collection = database.collection('acc');
            const result = yield collection.updateOne({ _id: client_id }, { $set: { ref: ref, code: code, stat: 1 } }, { upsert: true });
            console.log(`Matched ${result.matchedCount} document(s)`);
            console.log(`Modified ${result.modifiedCount} document(s)`);
            console.log(`Upserted document id: ${result.upsertedId}`);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            yield client.close();
        }
    }
    api_1.default.getAccessToken();
}));
app.get("/ping", (req, res) => res.send("pong " + Date.now()));
app.get("/uninstall", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log('Connected to MongoDB');
        const database = client.db('Widget');
        const collection = database.collection('acc');
        const result = yield collection.updateOne({ _id: config_1.default.CLIENT_ID }, { $set: { code: config_1.default.AUTH_CODE, stat: 0 } });
    }
    catch (err) {
        console.error(err);
    }
    finally {
        yield client.close();
    }
    res.send("Widget uninstalled");
}));
app.post("/switch", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id: leadsId, custom_fields, price: leadsPrice } = req.body.leads.update[0];
    const [{ id: fieldId, values }] = custom_fields;
    try {
        const map = new Map([
            [25661, 20707],
            [25663, 48669],
            [25665, 48671],
            [25667, 48673],
            [25669, 48675]
        ]);
        const services = [];
        if (fieldId == '48677') {
            values.forEach((element) => {
                services.push(Number(element.enum));
            });
        }
        const dealResponse = yield api_1.default.getDeal(Number(leadsId), ["contacts"]);
        const deal = dealResponse._embedded.contacts[0].id;
        const contactResponse = yield api_1.default.getContact(Number(deal));
        const price = contactResponse.custom_fields_values;
        const purchasedServices = {};
        price.forEach((element) => {
            if ([...map.values()].includes(element.field_id)) {
                purchasedServices[element.field_id] = element.values[0].value;
            }
        });
        const budget = (0, calculator_1.default)(services, purchasedServices, map);
        const updateDeal = [{
                "id": Number(leadsId),
                "price": budget
            }];
        if (budget !== Number(leadsPrice)) {
            let tasks = yield api_1.default.getTasks(Number(leadsId));
            yield api_1.default.updateDeals(updateDeal);
            if (tasks.length === 0) {
                const deadline = Math.floor((new Date((new Date()).getTime() + 24 * 60 * 60 * 1000)).getTime() / 1000);
                const task = [
                    {
                        "task_type_id": 3525410,
                        "text": "Проверить бюджет",
                        "complete_till": deadline,
                        "entity_id": Number(leadsId),
                        "entity_type": "leads",
                    }
                ];
                yield api_1.default.createTask(task);
            }
        }
        res.status(200).send('Ok');
    }
    catch (error) {
        const axiosError = error;
        const statusCode = ((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) || 500;
        const errorMessage = ((_c = (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Error';
        res.status(statusCode).send(errorMessage);
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
