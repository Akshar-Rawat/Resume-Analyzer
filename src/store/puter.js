import { getPuter } from "../utils/getPuter";
import { create } from "zustand";



const setError = (msg, set, get) => {
  set({
    error: msg,
    isLoading: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn: get().auth.signIn,
      signOut: get().auth.signOut,
      refreshUser: get().auth.refreshUser,
      checkAuthStatus: get().auth.checkAuthStatus,
      getUser: get().auth.getUser,
    },
  });
};

const checkAuthStatus = async (set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return false;
  }

  set({ isLoading: true, error: null });

  try {
    const isSignedIn = await puter.auth.isSignedIn();
    if (isSignedIn) {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user,
        },
        isLoading: false,
      });
      return true;
    } else {
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null,
        },
        isLoading: false,
      });
      return false;
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Failed to check auth status";
    setError(msg, set, get);
    return false;
  }
};

const signIn = async (set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }

  set({ isLoading: true, error: null });

  try {
    await puter.auth.signIn();
    await checkAuthStatus(set, get);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sign in failed";
    setError(msg, set, get);
  }
};

const signOut = async (set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }

  set({ isLoading: true, error: null });

  try {
    await puter.auth.signOut();
    set({
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: () => null,
      },
      isLoading: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sign out failed";
    setError(msg, set, get);
  }
};

const refreshUser = async (set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }

  set({ isLoading: true, error: null });

  try {
    const user = await puter.auth.getUser();
    set({
      auth: {
        user,
        isAuthenticated: true,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: () => user,
      },
      isLoading: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to refresh user";
    setError(msg, set, get);
  }
};

const init = (set, get) => {
  const puter = getPuter();
  if (puter) {
    set({ puterReady: true });
    checkAuthStatus(set, get);
    return;
  }

  let interval = setInterval(() => {
    if (getPuter()) {
      clearInterval(interval);
      set({ puterReady: true });
      checkAuthStatus(set, get);
    }
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    if (!getPuter()) {
      setError("Puter.js failed to load within 10 seconds", set, get);
    }
  }, 10000);
};

const write = async (path, data, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.fs.write(path, data);
};

const readDir = async (path, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.fs.readdir(path);
};

const readFile = async (path, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.fs.read(path);
};

const upload = async (files, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.fs.upload(files);
};

const deleteFile = async (path, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.fs.delete(path);
};

const chat = async (
  prompt,
  imageURL,
  testMode,
  options,
  set,
  get
) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.ai.chat(prompt, imageURL, testMode, options);
};

const feedback = async (path, message, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }

  return puter.ai.chat(
    [
      {
        role: "user",
        content: [
          {
            type: "file",
            puter_path: path,
          },
          {
            type: "text",
            text: message,
          },
        ],
      },
    ],
    { model: "claude-sonnet-4" }
  );
};

const img2txt = async (image, testMode, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.ai.img2txt(image, testMode);
};

const getKV = async (key, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.kv.get(key);
};

const setKV = async (key, value, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.kv.set(key, value);
};

const deleteKV = async (key, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.kv.delete(key);
};

const listKV = async (pattern, returnValues, set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  if (returnValues === undefined) returnValues = false;
  return puter.kv.list(pattern, returnValues);
};

const flushKV = async (set, get) => {
  const puter = getPuter();
  if (!puter) {
    setError("Puter.js not available", set, get);
    return;
  }
  return puter.kv.flush();
};

export const usePuterStore = create((set, get) => ({
  isLoading: true,
  error: null,
  puterReady: false,

  auth: {
    user: null,
    isAuthenticated: false,
    signIn: () => signIn(set, get),
    signOut: () => signOut(set, get),
    refreshUser: () => refreshUser(set, get),
    checkAuthStatus: () => checkAuthStatus(set, get),
    getUser: () => get().auth.user,
  },

  fs: {
    write: (path, data) => write(path, data, set, get),
    read: (path) => readFile(path, set, get),
    readDir: (path) => readDir(path, set, get),
    upload: (files) => upload(files, set, get),
    delete: (path) => deleteFile(path, set, get),
  },

  ai: {
    chat: (prompt, imageURL, testMode, options) =>
      chat(prompt, imageURL, testMode, options, set, get),
    feedback: (path, message) => feedback(path, message, set, get),
    img2txt: (image, testMode) => img2txt(image, testMode, set, get),
  },

  kv: {
    get: (key) => getKV(key, set, get),
    set: (key, value) => setKV(key, value, set, get),
    delete: (key) => deleteKV(key, set, get),
    list: (pattern, returnValues) => listKV(pattern, returnValues, set, get),
    flush: () => flushKV(set, get),
  },

  init: () => init(set, get),
  clearError: () => set({ error: null }),
}));