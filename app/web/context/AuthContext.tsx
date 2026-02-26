"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { LoginBody, LoginResponse } from "@/types/api";
import { User } from "@/types/base";
import { login as loginService } from "@/services/auth";

type AuthUser = Pick<User, "id" | "email" | "pseudonym" | "avatar">;

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    login: (body: LoginBody) => Promise<LoginResponse>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    async function login(body: LoginBody): Promise<LoginResponse> {
        const response = await loginService(body);
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        return response;
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    const value = useMemo(() => ({
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
    }), [user, token, login, logout]);


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}