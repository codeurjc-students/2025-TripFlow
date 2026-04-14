import styles from "@styles/components/form/Form.module.css";

import { useState } from "react";
import { useNavigate } from "react-router";
import type { ChangeEvent, FormEvent } from "react";
import type { ReactNode } from "react";

import type { Field } from "@/types/form";

import Button from "@components/shared/Button";
import Logo from "@components/shared/Logo";
import Tabs from "@components/shared/Tabs";
import FormGroup from "@components/form/FormGroup";

export type Errors = Record<string, string>;

export type Alternative = {
  alternative: string;
  alternativeLink: string;
  alternativeLabel: string;
};

type AuthFormProps<T extends Record<string, any>> = {
  active: "login" | "signup";
  fields: Field[];
  buttonLabel: string;
  onSubmit: (values: T) => void;
  errors?: Errors | null;
  belowSubmit?: ReactNode;
};

export default function AuthForm<T extends Record<string, any>>({
  active,
  fields,
  buttonLabel,
  onSubmit,
  errors,
  belowSubmit,
}: AuthFormProps<T>) {
  const [values, setValues] = useState<T>({} as T);
  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className={styles.container}>
      <Button style={["logo"]} to="/">
        <Logo size="medium" />
      </Button>
      <Tabs
        tabs={[
          { id: "login", label: "Iniciar Sesión" },
          { id: "signup", label: "Registrarse" },
        ]}
        activeTab={active}
        onChange={(id) => navigate(`/${id}`)}
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map((field, index) => (
          <FormGroup
            key={field.name}
            index={index}
            field={{ ...field, value: values[field.name] }}
            handleChange={handleChange}
            errors={errors || undefined}
          />
        ))}
        <Button style={["primary", "big"]} label={buttonLabel} type="submit" />
      </form>
      {errors && errors["global"] && (
        <div className={styles.error}>{errors["global"]}</div>
      )}
      {belowSubmit && <div className={styles.helperRow}>{belowSubmit}</div>}
      {!navigator.onLine && (
        <div className={styles.offlineWarning}>
          <p>
            Estás desconectado. Para autenticarte, por favor conéctate a
            Internet.
          </p>
        </div>
      )}
    </div>
  );
}
