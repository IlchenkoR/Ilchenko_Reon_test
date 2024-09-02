const calculateAge = require("./ageCalculator")

describe('calculateAge', () => {
    it('Должен корректно расчитать возраст по дате рождения', () => {
        const birthDate = new Date('2000-01-01').getTime() / 1000;
        const expectedAge = new Date().getFullYear() - 2000;
        const age = calculateAge(birthDate);

        expect(age).toBe(expectedAge);
    });

    it('Должен расчитывать дату раждения 29 февраля в высокосный год', () => {
        const birthDate = new Date('2000-02-29').getTime() / 1000;
        const expectedAge = new Date().getFullYear() - 2000;
        const age = calculateAge(birthDate);

        expect(age).toBe(expectedAge);
    });

    it('Должен вернуть 0 при указании будущей даты', () => {
        const birthDate = new Date().getTime()
        const age = calculateAge(birthDate);

        expect(age).toBe(0);
    });
});