export class SerializedSessionStorage<T> {
  get(key: string) {
    const serialized = window.sessionStorage.getItem(key);
    if (serialized !== null) {
      return JSON.parse(serialized) as T;
    }
  }
  set(fontKey: string, instructions: T) {
    window.sessionStorage.setItem(fontKey, JSON.stringify(instructions));
  }
}
