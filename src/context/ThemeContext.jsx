import React, { createContext, useState, useEffect } from 'react';

// 1. Membuat "Pabrik" Context
export const ThemeContext = createContext();

// 2. Membuat "Bungkus" yang akan menyelimuti seluruh aplikasi
export const ThemeProvider = ({ children }) => {

    // PERBAIKAN UTAMA: Baca ingatan dari localStorage secara sinkron saat pertama kali dimuat
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('shadowclips_theme');
            if (storedTheme) {
                return storedTheme; // Langsung gunakan Light/Dark dari memori
            }
            // Jika pengunjung baru pertama kali buka web, cek settingan bawaan HP/Laptop-nya
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light';
            }
        }
        return 'dark'; // Default mutlak jika semua gagal
    });

    // Efek Utama: Suntikkan class 'dark' ke HTML dan perbarui memori tiap kali tombol ditekan
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Pastikan memori browser selalu sinkron dengan tema saat ini
        localStorage.setItem('shadowclips_theme', theme);
    }, [theme]);

    // Fungsi saklar untuk ditekan dari tombol Navbar
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};