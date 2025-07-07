
// Wait for the given delay (in ms)
export const delay = async (delayMs: number) => {
  if (typeof window === 'object') {
    return new Promise(resolve => { window.setTimeout(resolve, delayMs); });
  } else if (typeof global === 'object') {
    return new Promise(resolve => { global.setTimeout(resolve, delayMs); });
  } else {
    throw new Error(`Unknown environment`);
  }
};
