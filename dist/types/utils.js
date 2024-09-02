"use strict";
/**
 * Модуль утилитарных функций:
 *  - для обработки данных из amoCRM;
 *  - общего назначения;
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
exports.getClearPhoneNumber = exports.getAllPages = exports.bulkOperation = exports.makeField = exports.getFieldValues = exports.getFieldValue = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("./logger"));
/**
 * Функция извлекает значение из id поля, массива полей custom_fields сущности amoCRM
 *
 * @param {*} customFields - массив полей сущности;
 * @param {*} fieldId - id поля из которого нужно получить значение;
 * @returns значение поля
 */
const getFieldValue = (customFields, fieldId) => {
    const field = customFields
        ? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
        : undefined;
    const value = field ? field.values[0].value : undefined;
    return value;
};
exports.getFieldValue = getFieldValue;
/**
 * Функция извлекает значения из id поля, массива полей custom_fields сущности amoCRM
 * Подходит для работы со списковыми или мультисписковыми полями
 *
 * @param {*} customFields - массив полей сущности;
 * @param {*} fieldId - id поля из которого нужно получить значения;
 * @returns массив значений поля
 */
const getFieldValues = (customFields, fieldId) => {
    const field = customFields
        ? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
        : undefined;
    const values = field ? field.values : [];
    return values.map(item => item.value);
};
exports.getFieldValues = getFieldValues;
/**
 * Функция заполнения поля в amoCRM
 * @param {*} field_id - id поля, которое планируется заполнить. Поле должно быть заранее создано в amoCRM, id копируется из amo;
 * @param {*} value - значение поля, тип данных должен быть идентичным с типом поля в amoCRM;
 * @param {*} enum_id - В случае, если поле списковое или мультисписковое, то для указания нужного значения указывается данный параметр, т.е. id - варианта списка;
 * @returns типовой объект с данными о поле, который необходимо передать в amoCRM.
 */
const makeField = (field_id, value, enum_id) => {
    if (value === undefined || value === null) {
        return undefined;
    }
    return {
        field_id,
        values: [
            {
                value,
                enum_id
            },
        ],
    };
};
exports.makeField = makeField;
/**
 * Функция для разбиения запроса на создание на несколько по chunkSize
 * @param {*} reqest - функция-запрос в amo
 * @param {*} data - данные запроса (до разбиения на chunkSize)
 * @param {*} chunkSize - размер chunkSize
 * @param {*} operationName - название операции
 */
const bulkOperation = (reqest_1, data_1, chunkSize_1, ...args_1) => __awaiter(void 0, [reqest_1, data_1, chunkSize_1, ...args_1], void 0, function* (reqest, data, chunkSize, operationName = "bulk") {
    let failed = [];
    if (data.length) {
        logger_1.default.debug(`Старт операции ${operationName}`);
        try {
            const chunksCount = data.length / chunkSize;
            for (let i = 0; i < chunksCount; i++) {
                try {
                    const sliced = data.slice(i * chunkSize, (i + 1) * chunkSize);
                    yield reqest(sliced);
                }
                catch (e) {
                    logger_1.default.error(e);
                    failed.push(...data.slice(i * chunkSize, (i + 1) * chunkSize));
                }
                logger_1.default.debug(`${operationName} ${i * chunkSize} - ${(i + 1) * chunkSize}`);
            }
        }
        catch (e) {
            logger_1.default.error(e);
        }
    }
    logger_1.default.debug(`операция "${operationName}" завершена. Неуспешных - ${failed.length}`);
    fs_1.default.writeFileSync(`${operationName}Failed.txt`, JSON.stringify(failed));
});
exports.bulkOperation = bulkOperation;
/**
 * Функция выгрузки всех страниц сущности в amoCRM.
 * @param {*} request - функция-запрос, которая будет выполняться рекурсивно
 * @param {*} page - номер страницы (стартует с 1)
 * @param {*} limit - лимит на количество элементов в ответе (по дефолту - 200)
 * @returns [ ...elements ] все элементы сущности аккаунта
 */
const getAllPages = (request_1, ...args_1) => __awaiter(void 0, [request_1, ...args_1], void 0, function* (request, page = 1, limit = 200) {
    try {
        console.log(`Загрузка страницы ${page}`);
        const res = yield request({ page, limit });
        if (res.length === limit) {
            const next = yield getAllPages(request, page + 1, limit);
            return [...res, ...next];
        }
        return res;
    }
    catch (e) {
        logger_1.default.error(e);
        return [];
    }
});
exports.getAllPages = getAllPages;
/**
 * Функция принимает строку в которой есть цифры и символы и возвращает строку только с цифрами
 * применялась чтобы получать чистый номер телефона
 * @param {*} tel - String
 * @returns String | undefined
 */
const getClearPhoneNumber = (tel) => {
    return tel ? tel.split("").filter(item => new RegExp(/\d/).test(item)).join("") : undefined;
};
exports.getClearPhoneNumber = getClearPhoneNumber;
