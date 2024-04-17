export const randomString = () => {
  const array = new Uint8Array(8);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
    return Buffer.from(array).toString('hex');
  } else {
    return `${Math.floor(Math.random() * 999999)}`;
  }
};
