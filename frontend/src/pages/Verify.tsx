import styles from "@styles/components/form/Form.module.css";
import verifyStyles from "@styles/pages/Verify.module.css";

import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";

import { retrieveFromLocalStorage, removeFromLocalStorage } from "@/utils/localStorageUtils";
import { STORAGE_KEYS } from "@/constants/storageKeys";

import { useNotification } from "@/providers/notificationProvider";
import { useAuth } from "@/providers/authProvider";
import { resendCode } from "@/services/authService";

import Button from "@components/shared/Button";
import Logo from "@components/shared/Logo";
import Layout from "@/layouts/Layout";

export default function VerifyPage() {
    const { verify } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const username = retrieveFromLocalStorage<string>(STORAGE_KEYS.VERIFICATION_USERNAME);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        if (value.length > 1) {
            value = value.slice(-1);
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        setError(null);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, '').slice(0, 6).split("");
        const newCode = [...code];
        pastedData.forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);
        if (pastedData.length < 6) {
            inputRefs.current[pastedData.length]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleResendCode = async () => {
        if (!username) return;
        const res = await resendCode(username);
        if (res.status === "SUCCESS") {
            notify("Código reenviado exitosamente", "success");
        } else {
            notify("Error al reenviar el código", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            setError("El código debe tener 6 dígitos.");
            return;
        }
        if (!username) return;

        const res = await verify({ username, code: fullCode });
        if (res.success) {
            removeFromLocalStorage(STORAGE_KEYS.VERIFICATION_USERNAME);
            notify("Cuenta verificada exitosamente", "success");
            navigate("/dashboard");
        } else {
            if (res.errors?.error === "User is already verified") {
                navigate("/login");
            } else {
                setError("Código inválido.");
            }
        }
    };

    if (!username) {
        return (
            <Layout single>
                <div className={`${styles.container} ${styles.center}`}>
                    <Button style={["logo"]} to="/">
                        <Logo size="medium" />
                    </Button>
                    <div className={verifyStyles.verificationContainer}>
                        <h1 className={verifyStyles.title}>Verificación Requerida</h1>
                        <p className={verifyStyles.description}>
                            No se ha encontrado la información del usuario a verificar.
                            Por favor, registra una cuenta primero.
                        </p>
                        <Button style={["primary"]} to="/signup" label="Registrarse" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout single>
            <div className={`${styles.container} ${styles.center}`}>
                <Button style={["logo"]} to="/">
                    <Logo size="medium" />
                </Button>

                <div className={verifyStyles.verificationContainer}>
                    <div className={verifyStyles.header}>
                        <h1 className={verifyStyles.title}>Verificación Segura</h1>
                        <p className={verifyStyles.description}>
                            Hemos enviado un código de 6 dígitos a tu correo. Introduce el código para verificar tu cuenta de <strong>{username}</strong>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={verifyStyles.form}>
                        <div className={verifyStyles.codeContainer} onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className={verifyStyles.codeInput}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                />
                            ))}
                        </div>

                        {error && <div className={verifyStyles.error}>{error}</div>}

                        <Button
                            style={["primary", "big"]}
                            label="Verificar Cuenta"
                            type="submit"
                        />
                    </form>

                    <div className={styles.helperRow}>
                        <span className={styles.helperHint}>¿No has recibido el código?</span>
                        <button className={styles.helperLink} type="button" onClick={handleResendCode}>
                            Reenviar código
                        </button>
                        <NavLink className={styles.helperLink} to="/login">
                            Volver a iniciar sesión
                        </NavLink>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
