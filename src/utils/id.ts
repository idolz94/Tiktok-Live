export function createOrderCode() {
  return `DH${Date.now().toString().slice(-8)}`;
}

export function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}
