import { useEffect, useState } from "react";


export function useTheme() {

    const [theme, setTheme] = useState(() => {

        const savedTheme =
            localStorage.getItem("qflow-theme");

        if (savedTheme === "dark" ||
            savedTheme === "light") {

            return savedTheme;

        }

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";

    });


    useEffect(() => {

        const root =
            document.documentElement;


        root.classList.remove(
            "dark",
            "light"
        );


        root.classList.add(theme);


        localStorage.setItem(
            "qflow-theme",
            theme
        );

    }, [theme]);


    function toggleTheme() {

        setTheme(
            current =>
                current === "dark"
                    ? "light"
                    : "dark"
        );

    }


    return {
        theme,
        setTheme,
        toggleTheme
    };

}