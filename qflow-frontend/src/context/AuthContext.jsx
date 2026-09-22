import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    login as loginApi,
    logout as logoutApi,
    getCurrentUser,
    getToken
} from "../services/authApi";


// =========================================================
// AUTH CONTEXT
// =========================================================

const AuthContext = createContext(null);


// =========================================================
// AUTH PROVIDER
// =========================================================

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(null);

    const [loading, setLoading] = useState(true);


    // =====================================================
    // RESTORE LOGIN FROM LOCAL STORAGE
    // =====================================================

    useEffect(() => {

        const storedToken = getToken();
        const storedUser = getCurrentUser();

        if (storedToken && storedUser) {

            setToken(storedToken);

            setUser(storedUser);
        }

        setLoading(false);

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = async (
        email,
        password
    ) => {

        const data =
            await loginApi(
                email,
                password
            );

        /*
         * authApi.login() already stores:
         *
         * qflow_token
         * qflow_user
         *
         * in localStorage.
         */

        setToken(data.token);

        setUser({
            userId: data.userId,
            name: data.name,
            email: data.email,
            role: data.role
        });

        return data;
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        logoutApi();

        setToken(null);

        setUser(null);
    };


    // =====================================================
    // AUTHENTICATION STATUS
    // =====================================================

    const isAuthenticated =
        Boolean(token && user);


    // =====================================================
    // ADMIN STATUS
    // =====================================================

    const isAdmin =
        user?.role === "ADMIN";


    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = {

        // User information
        user,

        // JWT
        token,

        // Authentication state
        isAuthenticated,

        // Authorization state
        isAdmin,

        // Loading while restoring session
        loading,

        // Actions
        login,
        logout
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


// =========================================================
// useAuth HOOK
// =========================================================

export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
}