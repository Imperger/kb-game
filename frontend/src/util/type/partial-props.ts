export type PartialProps<T, P extends keyof T> = Omit<T, P> & Partial<Pick<T, P>>;
