// Auth is now handled entirely by Clerk.
// This file is kept as a stub so existing imports don't break during migration.
// Remove references to these exports from any remaining callers.

export type SignUpPayload = {
  fullName: string;
  phone: string;
  password: string;
  tiktokId: string;
};

export type SignInPayload = {
  phone: string;
  password: string;
  remember?: boolean;
};

/** @deprecated Use Clerk useSignIn hook instead */
export async function signInApi(_payload: SignInPayload): Promise<void> {
  throw new Error("signInApi is deprecated — use Clerk useSignIn hook");
}

/** @deprecated Use Clerk useSignUp hook instead */
export async function signUpApi(_payload: SignUpPayload): Promise<void> {
  throw new Error("signUpApi is deprecated — use Clerk useSignUp hook");
}

/** @deprecated Use Clerk signOut() instead */
export async function signOutApi(): Promise<boolean> {
  throw new Error("signOutApi is deprecated — use Clerk signOut()");
}
