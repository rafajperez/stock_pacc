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

  const ALLOWED_EMAILS = [
    "rafaperez_dev@hotmail.com",
    "gerente@pacc.org.br",
    "secretaria@pacc.org.br",
  ];
  const handleLogin = async () => {
    setError("");

    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setError("Acesso negado: Este e-mail não está autorizado.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/estoque");
    } catch (err: any) {
      setError("E-mail ou senha incorretos.");
      console.error(err.code);
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
