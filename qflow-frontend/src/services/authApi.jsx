import api from "./api";

export async function login(email, password) {

    const response = await api.post(
        "/auth/login",
        {
            email,
            password,
        }
    );

    const data = response.data;

    localStorage.setItem(
        "qflow_token",
        data.token
    );

    localStorage.setItem(
        "qflow_user",
        JSON.stringify({
            userId: data.userId,
            name: data.name,
            email: data.email,
            role: data.role,
        })
    );

    return data;
}


export async function register(
    name,
    email,
    password
) {

    const response = await api.post(
        "/auth/register",
        {
            name,
            email,
            password,
        }
    );

    const data = response.data;

    localStorage.setItem(
        "qflow_token",
        data.token
    );

    localStorage.setItem(
        "qflow_user",
        JSON.stringify({
            userId: data.userId,
            name: data.name,
            email: data.email,
            role: data.role,
        })
    );

    return data;
}


export function logout() {

    localStorage.removeItem(
        "qflow_token"
    );

    localStorage.removeItem(
        "qflow_user"
    );
}


export function getCurrentUser() {

    const user =
        localStorage.getItem("qflow_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}


export function getToken() {

    return localStorage.getItem(
        "qflow_token"
    );
}