import { Metadata } from 'next';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MetadataFn = (...args: any[]) => Promise<Metadata>;
