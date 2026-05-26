"use client";

import useSWR from "swr";
import { AuthUser } from "../types";
import { createId } from "../utils/id";

type Account = {
  id: string;
  username: string;
  password: string;
};

type AuthState = {
  accounts: Account[];
  user: AuthUser | null;
};

type AuthResult = {
  ok: boolean;
  message?: string;
};

const AUTH_SWR_KEY = "flive/auth";
const ACCOUNT_STORAGE_KEY = "flive_accounts";
const USER_STORAGE_KEY = "flive_user";

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "admin",
    username: "admin",
    password: "123456",
  },
  {
    id: "phone-demo",
    username: "0816507286",
    password: "123456",
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mergeDefaultAccounts(accounts: Account[]) {
  const map = new Map<string, Account>();

  DEFAULT_ACCOUNTS.forEach((account) => {
    map.set(account.username.toLowerCase(), account);
  });

  accounts.forEach((account) => {
    map.set(account.username.toLowerCase(), account);
  });

  return Array.from(map.values());
}

function readAuthState(): AuthState {
  if (!canUseStorage()) {
    return {
      accounts: DEFAULT_ACCOUNTS,
      user: null,
    };
  }

  const savedAccounts = safeParse<Account[]>(
    window.localStorage.getItem(ACCOUNT_STORAGE_KEY),
    DEFAULT_ACCOUNTS
  );

  const savedUser = safeParse<AuthUser | null>(window.localStorage.getItem(USER_STORAGE_KEY), null);

  return {
    accounts: mergeDefaultAccounts(savedAccounts),
    user: savedUser,
  };
}

function writeAuthState(state: AuthState) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(state.accounts));

  if (state.user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function useAuth() {
  const { data, mutate, isLoading } = useSWR<AuthState>(AUTH_SWR_KEY, readAuthState, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const state: AuthState = data ?? {
    accounts: DEFAULT_ACCOUNTS,
    user: null,
  };

  function updateAuthState(nextState: AuthState) {
    writeAuthState(nextState);
    mutate(nextState, false);
  }

  function login(username: string, password: string): AuthResult {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      return {
        ok: false,
        message: "Vui lòng nhập tài khoản và mật khẩu",
      };
    }

    const account = state.accounts.find(
      (item) =>
        item.username.toLowerCase() === cleanUsername.toLowerCase() && item.password === password
    );

    if (!account) {
      return {
        ok: false,
        message: "Sai tài khoản hoặc mật khẩu",
      };
    }

    updateAuthState({
      ...state,
      user: {
        id: account.id,
        username: account.username,
      },
    });

    return { ok: true };
  }

  function register(username: string, password: string): AuthResult {
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return {
        ok: false,
        message: "Tài khoản cần ít nhất 3 ký tự",
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        message: "Mật khẩu cần ít nhất 6 ký tự",
      };
    }

    const existed = state.accounts.some(
      (item) => item.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (existed) {
      return {
        ok: false,
        message: "Tài khoản đã tồn tại",
      };
    }

    const account: Account = {
      id: createId(),
      username: cleanUsername,
      password,
    };

    updateAuthState({
      accounts: [account, ...state.accounts],
      user: {
        id: account.id,
        username: account.username,
      },
    });

    return { ok: true };
  }

  function logout() {
    updateAuthState({
      ...state,
      user: null,
    });
  }

  return {
    user: state.user,
    isLoading,
    login,
    register,
    logout,
  };
}
