import styles from "@styles/components/form/Form.module.css";
import resetStyles from "@styles/pages/ResetPassword.module.css";

import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { LockIcon, UserIcon } from "lucide-react";

import type { ResetPasswordOtpRequest } from "@/types/auth";

import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import FormGroup from "@/components/form/FormGroup";
import { retrieveFromLocalStorage } from "@/utils/localStorageUtils";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { forgotPassword, resetPassword } from "@/services/authService";
import { validatePassword } from "@/utils/validationUtils";
import { useNotification } from "@/providers/notificationProvider";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [values, setValues] = useState<ResetPasswordOtpRequest>({
    username: retrieveFromLocalStorage<string>(STORAGE_KEYS.RESET_PASSWORD_USERNAME) || "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGlobalMessage(null);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    setValues((prev) => ({ ...prev, code: next.join("") }));
    setErrors((prev) => ({ ...prev, code: "" }));

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = Array(6).fill("");
    pasted.forEach((char, index) => {
      next[index] = char;
    });
    setCodeDigits(next);
    setValues((prev) => ({ ...prev, code: next.join("") }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!values.username.trim()) {
      nextErrors.username = "El usuario o email es obligatorio.";
    }

    if (values.code.length !== 6) {
      nextErrors.code = "El código debe tener 6 dígitos.";
    }

    const passwordValidation = validatePassword(values.password, values.confirmPassword);
    if (!passwordValidation.isValid) {
      nextErrors.password = passwordValidation.error || "Contraseña inválida.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const res = await resetPassword({
      username: values.username.trim(),
      code: values.code,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

    if (res.status === "SUCCESS") {
      navigate("/login");
      return;
    }

    if (res.errors?.code) {
      setErrors((prev) => ({ ...prev, code: res.errors.code }));
    } else if (res.errors?.password) {
      setErrors((prev) => ({ ...prev, password: res.errors.password }));
    } else {
      setGlobalMessage("No se pudo restablecer la contraseña. Intenta de nuevo.");
    }
  };

  const handleResendCode = async () => {
    const usernameOrEmail = values.username.trim();

    if (!usernameOrEmail) {
      navigate("/forgot-password");
      return;
    }

    const res = await forgotPassword({ username: usernameOrEmail });
    if (res.status === "SUCCESS") {
      notify("Código reenviado exitosamente", "success");
    } else {
      notify("No se pudo reenviar el código", "error");
    }
  };

  return (
    <Layout single centerContent>
      <div className={`${styles.container} ${styles.center}`}>
        <div className={resetStyles.resetContainer}>
          <div className={resetStyles.header}>
            <h1 className={resetStyles.title}>Restablecer contraseña</h1>
            <p className={resetStyles.description}>
              Introduce el código de 6 dígitos y tu nueva contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={resetStyles.form}>
            <FormGroup
              field={{
                name: "username",
                label: "Usuario / Email",
                value: values.username,
                placeholder: "usuario@correo.com",
                icon: <UserIcon size={16} />,
              }}
              handleChange={handleChange}
              errors={errors}
            />

            <div className={resetStyles.codeContainer} onPaste={handleCodePaste}>
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={resetStyles.codeInput}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                />
              ))}
            </div>
            {errors.code && <div className={resetStyles.error}>{errors.code}</div>}

            <FormGroup
              field={{
                name: "password",
                label: "Nueva contraseña",
                type: "password",
                value: values.password,
                placeholder: "********",
                icon: <LockIcon size={16} />,
              }}
              handleChange={handleChange}
              errors={errors}
            />

            <FormGroup
              field={{
                name: "confirmPassword",
                label: "Confirmar contraseña",
                type: "password",
                value: values.confirmPassword,
                placeholder: "********",
                icon: <LockIcon size={16} />,
              }}
              handleChange={handleChange}
              errors={errors}
            />

            {globalMessage && <div className={resetStyles.error}>{globalMessage}</div>}

            <div className={resetStyles.actions}>
              <Button style={["primary", "big"]} type="submit" label="Actualizar contraseña" />

              <div className={resetStyles.actionLinks}>
                <button className={styles.helperLink} type="button" onClick={handleResendCode}>
                  Reenviar código
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
