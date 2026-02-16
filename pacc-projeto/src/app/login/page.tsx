"use client";

import styles from "./login.module.scss";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className={styles.mainContainer}>
      {/* Lado Esquerdo: Sidebar de Login */}
      <aside className={styles.sidebar}>
        <div className={styles.loginCard}>
          <h1>Bem-vindo</h1>
          <p>Acesse o sistema PACC</p>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Usuário</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Digite seu usuário"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className={styles.btnPrimary}>
              Entrar
            </button>
          </form>
        </div>
      </aside>

      {/* Lado Direito: Logo da ONG */}
      <section className={styles.logoArea}>
        <div className={styles.logoWrapper}>
          {/* Por enquanto um placeholder, depois colocamos o logo real */}
          <div className={styles.placeholderLogo}>PACC</div>
          <h2>Projeto Amigos Contra o Câncer</h2>
        </div>
      </section>
    </main>
  );
}
