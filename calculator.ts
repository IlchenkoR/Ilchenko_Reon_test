function calculateSum(services: number[], purchasedServices: { [key: string]: string }, map: Map<number, number>): number {
    let sum = 0;

    services.forEach(num => {
        const key = map.get(num);
        if (key !== undefined) {
            const value = purchasedServices[key.toString()];
            if (value !== undefined) {
                sum += parseInt(value, 10);
            }
        }
    });
    
    return sum;
}
  
export default calculateSum;