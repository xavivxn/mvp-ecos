export const THEME_STORAGE_KEY = "ecos-theme";

export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.classList.add("theme-"+t);}}catch(e){}})();`;
