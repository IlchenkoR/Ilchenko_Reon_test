function calculateSum(array: number[], i: { [key: string]: string }, map: Map<number, number>): number {
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
  
export default calculateSum;