const USER_KEY = 'auth_user';

export function saveUser(user: object): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser<T>(): T | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}
