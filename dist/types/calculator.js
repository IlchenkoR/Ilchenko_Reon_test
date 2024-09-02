"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calculateSum(array, i, map) {
    let sum = 0;
    array.forEach(num => {
        const key = map.get(num);
        if (key !== undefined) {
            const value = i[key.toString()];
            if (value !== undefined) {
                sum += parseInt(value, 10);
            }
        }
    });
    return sum;
}
exports.default = calculateSum;
