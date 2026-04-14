import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { MailIcon } from "lucide-react";

import type { ForgotPasswordRequest } from "@/types/auth";

import Layout from "@/layouts/Layout";
import AuthForm from "@/components/form/AuthForm";
import { forgotPassword } from "@/services/authService";
import { saveToLocalStorage } from "@/utils/localStorageUtils";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import formStyles from "@/styles/components/form/Form.module.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string> | null>(null);

  const handleSubmit = async (values: ForgotPasswordRequest) => {
    setErrors(null);

    if (!values.username || values.username.trim() === "") {
      setErrors({ username: "El usuario o email es obligatorio." });
      return;
    }

    const normalizedUsername = values.username.trim();
    await forgotPassword({ username: normalizedUsername });
    saveToLocalStorage(STORAGE_KEYS.RESET_PASSWORD_USERNAME, normalizedUsername);
    navigate("/reset-password");
  };

  return (
    <Layout single centerContent>
      <AuthForm
        active="login"
        fields={[
          {
            name: "username",
            label: "Usuario / Email",
            placeholder: "usuario@correo.com",
            icon: <MailIcon size={16} />,
          },
        ]}
        buttonLabel="Enviar código"
        onSubmit={handleSubmit}
        errors={errors}
        belowSubmit={
          <>
            <NavLink to="/login">Volver a iniciar sesión</NavLink>
            <span className={formStyles.helperHint}>
              Te enviaremos un código de 6 dígitos.
            </span>
          </>
        }
      />
    </Layout>
  );
}
