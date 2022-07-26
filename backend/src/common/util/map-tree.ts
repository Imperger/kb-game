type ChildrenProp<T, C extends keyof T> = T[C] extends T[] ? C : never;

const MapTree = <T, C extends keyof T>(
  target: T,
  childrenProp: ChildrenProp<T, C>,
  mapFn: (x: T) => any
) => {
  const result = mapFn(target);
  const childs: T[] = target[childrenProp] as any; // TODO: Avoid any cast
  result[childrenProp] = childs.map((x: T) => MapTree(x, childrenProp, mapFn));
  return result;
};

export default MapTree;
