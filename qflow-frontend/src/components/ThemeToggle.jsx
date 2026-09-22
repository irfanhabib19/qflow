import { useTheme } from "../hooks/useTheme.jsx";


function ThemeToggle() {

    const {
        theme,
        toggleTheme
    } = useTheme();


    return (

        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className="
                group
                relative
                flex
                h-10
                items-center
                gap-1
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900
                p-1
                transition
                hover:border-zinc-700
            "
        >

            <span className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-sm
                transition-all
                ${
                theme === "light"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500"
            }
            `}>
                ☀️
            </span>


            <span className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-sm
                transition-all
                ${
                theme === "dark"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500"
            }
            `}>
                🌙
            </span>

        </button>

    );

}


export default ThemeToggle;