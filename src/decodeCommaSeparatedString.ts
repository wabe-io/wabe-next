import { DecodeError, Decoder } from 'ts-decoder';

export const decodeCommaSeparatedString: Decoder<string[]> = (
  input: unknown,
) => {
  if (typeof input !== 'string') {
    throw new DecodeError('Input is not a string');
  }

  return input.split(',');
};
