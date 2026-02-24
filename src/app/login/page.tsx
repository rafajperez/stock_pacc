"use client";

import styles from "./login.module.scss";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    const allowedEmailsEnv = process.env.NEXT_PUBLIC_ALLOWED_EMAILS;
    console.log("Variável do ENV carregada:", allowedEmailsEnv);

    if (!allowedEmailsEnv) {
      setError("Erro interno: Lista de permissões não configurada.");
      return;
    }

    const emailsPermitidos = allowedEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase());
    const emailDigitado = email.trim().toLowerCase();

    if (!emailsPermitidos.includes(emailDigitado)) {
      setError("Acesso negado: Este e-mail não está autorizado.");
      return;
    }

    try {
      console.log("Iniciando autenticação no Firebase...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailDigitado,
        password,
      );

      if (userCredential.user) {
        console.log("Autenticado! Redirecionando para o estoque...");
        window.location.href = "/estoque";
      }
    } catch (err: any) {
      console.error("Erro no Firebase:", err.code);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found"
      ) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Erro ao conectar com o servidor. Tente novamente.");
      }
    }
  };

  return (
    <main className={styles.mainContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.loginCard}>
          <h1>Bem-vindo</h1>
          <p>Acesse o sistema PACC</p>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.inputGroup}>
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@pacc.org.br"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className={styles.btnPrimary}>
              Entrar
            </button>
          </form>
        </div>
      </aside>

      <section className={styles.logoArea}>
        <Image
          src="/Logo-PACC-NOVA.png"
          alt="Logo PACC"
          width={400}
          height={400}
          priority
        />
      </section>
    </main>
  );
}
