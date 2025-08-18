// Initialize localStorage with default values
export const initStorage = () => {
  if (!localStorage.getItem("creators")) {
    localStorage.setItem("creators", JSON.stringify([]));
  }
  if (!localStorage.getItem("campaigns")) {
    localStorage.setItem("campaigns", JSON.stringify([]));
  }
};

// Generic getter
export const getStorageItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

// Generic setter
export const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Generic remover
export const removeStorageItem = (key) => {
  localStorage.removeItem(key);
};
