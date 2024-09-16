function calculateSum(services: number[], purchasedServices: { [key: string]: number }, map: Map<string, number[]>): number {
    const mapEntries = Array.from(map.entries());
    return services.reduce((acc, num) => {
        const key = mapEntries.find(([_, idsArray]) => idsArray.includes(num))?.[1][1]
        if (key !== undefined) {
            const value = purchasedServices[key.toString()]
            if (value !== undefined) {
                return acc + value
            }
        }
        return acc;
    }, 0);
}
  
export default calculateSum;