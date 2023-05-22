const APPEARANCE_KEY = "appearance";

const classList = document.documentElement.classList;

const setClassList = (isDark = false) => {
  if (isDark) {
    classList.add("dark");
  } else {
    classList.remove("dark");
  }
};

const updateAppearance = () => {
  const userPreference = localStorage.getItem(APPEARANCE_KEY);
  setClassList(userPreference === "dark");
};

// 初始化时，取 localStorage 保存的。并且监听 storage 事件，解决多个 tab 同步
if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
  updateAppearance();
  window.addEventListener('storage', updateAppearance);
}

export function toggle() {
  if (classList.contains("dark")) {
    setClassList(false);
    // 本地状态存储
    localStorage.setItem(APPEARANCE_KEY, "light");
  } else {
    setClassList(true);
    // 本地状态存储
    localStorage.setItem(APPEARANCE_KEY, "dark");
  }
}