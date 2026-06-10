export function phoneToAuthEmail(phone: string) {
  const rawPhone = phone;

  let hash = 0;

  for (let index = 0; index < rawPhone.length; index += 1) {
    hash = (hash << 5) - hash + rawPhone.charCodeAt(index);
    hash |= 0;
  }

  const safeHash = Math.abs(hash).toString(36);

  return `phone.${safeHash}@phone-auth.lumi.app`;
}

export function usernameToAuthEmail(username: string) {
  const raw = username.toLowerCase().trim();

  let hash = 0;

  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(index);
    hash |= 0;
  }

  const safeHash = Math.abs(hash).toString(36);

  return `user.${safeHash}@username-auth.lumi.app`;
}