function calculateSum(services: number[], purchasedServices: { [key: string]: string }, map: Map<number, number>): number {
    const sum = services.reduce((acc, num) => {
        const key = map.get(num);
        if (key !== undefined) {
            const value = purchasedServices[key.toString()];
            if (value !== undefined) {
                return acc + parseInt(value, 10);
            }
        }
        return acc;
    }, 0);
    
    return sum;
}
  
export default calculateSum;