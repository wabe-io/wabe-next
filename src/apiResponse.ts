import { HttpStatusCodes } from 'wabe-ts';

export interface ApiResponseParams<T> {
  contentType?: string;
  data?: T;
  setCookies?: [string, string][];
  setHeaders?: [string, string][];
  status?: HttpStatusCodes;
}

export const apiResponse = <T>(
  params: ApiResponseParams<T>,
): ApiResponse<T> => ({
  ...params,
  type: 'wabe-next-api-response',
});

export const textApiResponse = (
  params: Omit<ApiResponseParams<string>, 'contentType'>,
): ApiResponse<string> => ({
  contentType: 'plain/text',
  ...params,
  type: 'wabe-next-api-response',
});

export type ApiResponse<T> = ApiResponseParams<T> & {
  type: 'wabe-next-api-response';
};

export const isApiResponse = <T>(input: unknown): input is ApiResponse<T> => {
  return (
    typeof input === 'object' &&
    input != null &&
    'type' in input &&
    (input as { type: string }).type === 'wabe-next-api-response'
  );
};
