import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "@/providers/authProvider";
import { validatePassword, validateUsername } from "@/utils/validationUtils";
import { saveToLocalStorage } from "@/utils/localStorageUtils";
import { STORAGE_KEYS } from "@/constants/storageKeys";

import type { RegisterRequest } from "@/types/auth";

import { LockIcon, MailIcon, UserIcon } from "lucide-react";

import Layout from "@/layouts/Layout";
import AuthForm from "@components/form/AuthForm";

import { useSeo } from "@/hooks/useSeo";

export default function RegisterPage() {
    useSeo(
        "Crear cuenta | TripFlow",
        "Regístrate gratis en TripFlow y empieza a planificar viajes con itinerarios generados por IA."
    );

    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState<Record<string, string> | null>(null);

    // If user is already logged in, redirect to dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    // Handle registration form submission
    const handleRegister = async (values: RegisterRequest) => {
        let isValid = true;
        setErrors(null);

        const usernameValidation = validateUsername(values.username);
        if (!usernameValidation.isValid) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                username: usernameValidation.error as string,
            }));
            isValid = false;
        }

        const passwordValidation = validatePassword(
            values.password,
            values.confirmPassword
        );
        if (!passwordValidation.isValid) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: passwordValidation.error as string,
            }));
            isValid = false;
        }

        if (!isValid) return;

        const res = await register(values);
        if (res.success) {
            saveToLocalStorage(STORAGE_KEYS.VERIFICATION_USERNAME, values.username);
            navigate("/verify");
        } else {
            setErrors(res.errors as Record<string, string>);
        }
    };

    return (
        <Layout single centerContent>
            <AuthForm
                active="signup"
                fields={[
                    {
                        name: "email",
                        label: "Correo electrónico",
                        type: "email",
                        placeholder: "cub1z@example.com",
                        required: true,
                        icon: <MailIcon size={16} />,
                    },
                    {
                        name: "username",
                        label: "Usuario",
                        placeholder: "CuB1z",
                        required: true,
                        icon: <UserIcon size={16} />,
                    },
                    {
                        name: "password",
                        label: "Contraseña",
                        type: "password",
                        placeholder: "********",
                        required: true,
                        icon: <LockIcon size={16} />,
                    },
                    {
                        name: "confirmPassword",
                        label: "Confirmar contraseña",
                        type: "password",
                        placeholder: "********",
                        required: true,
                        icon: <LockIcon size={16} />,
                    },
                ]}
                buttonLabel="Registrarse"
                onSubmit={(values: RegisterRequest) => handleRegister(values)}
                errors={errors}
            />
        </Layout>
    );
}
