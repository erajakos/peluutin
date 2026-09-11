/** A stand-in for the browser's localStorage, fresh for every test. */
export function installStorage() {
  const data = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => data.set(key, String(value)),
      removeItem: (key) => data.delete(key),
    },
  }
  return data
}
