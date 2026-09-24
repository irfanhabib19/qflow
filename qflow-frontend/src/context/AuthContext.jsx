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


// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext =
    createContext(null);


// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {

    const [user, setUser] =
        useState(null);

    const [token, setToken] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // =====================================================
    // RESTORE LOGIN
    // =====================================================

    useEffect(() => {

        const storedToken =
            getToken();

        const storedUser =
            getCurrentUser();


        if (
            storedToken &&
            storedUser
        ) {

            setToken(
                storedToken
            );

            setUser(
                storedUser
            );

        } else {

            setToken(null);

            setUser(null);
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


        setToken(
            data.token
        );


        setUser({

            userId:
            data.userId,

            name:
            data.name,

            email:
            data.email,

            role:
            data.role

        });


        return data;
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        // -----------------------------------------
        // REMOVE ONLY AUTH DATA
        // -----------------------------------------

        logoutApi();


        // -----------------------------------------
        // IMPORTANT:
        // DO NOT REMOVE USER TICKET CACHE
        // -----------------------------------------
        //
        // Ticket keys are user-specific:
        //
        // qflow-ticket-${userId}-${queueId}
        //
        // Therefore another user cannot use
        // the previous user's ticket key.
        //
        // Keeping the key allows the same user
        // to see their ticket after logging in again.
        //
        // -----------------------------------------


        // -----------------------------------------
        // CLEAR REACT AUTH STATE
        // -----------------------------------------

        setToken(null);

        setUser(null);
    };


    // =====================================================
    // AUTHENTICATED
    // =====================================================

    const isAuthenticated =
        Boolean(
            token &&
            user
        );


    // =====================================================
    // ADMIN
    // =====================================================

    const isAdmin =
        user?.role === "ADMIN";


    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = {

        user,

        token,

        isAuthenticated,

        isAdmin,

        loading,

        login,

        logout

    };


    // =====================================================
    // PROVIDER
    // =====================================================

    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );
}


// =====================================================
// useAuth
// =====================================================

export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }


    return context;
}