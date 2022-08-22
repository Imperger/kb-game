export function exponentialDistribution(place: number, totalPlaces: number): number {
  const fn = (x: number) => (2 ** (totalPlaces - x) - 1);
  
  return  fn(place) / 
          Array.from({ length: totalPlaces }, (x, i) => i + 1)
            .map(x => fn(x))
            .reduce((acc, x) => acc + x, 0);
}
