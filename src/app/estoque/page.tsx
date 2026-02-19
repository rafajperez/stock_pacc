"use client";

import { useState } from "react";
import ListaEstoque from "@/components/ListaEstoque";
import ModalCadastro from "@/components/ModalCadastro";
import ModalSaida from "@/components/ModalSaida"; // Importando o novo modal
import styles from "./estoque.module.scss";

export default function EstoquePage() {
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Estoque PACC</h1>
          <div className={styles.buttonGroup}>
            <button
              className={styles.btnEntrada}
              onClick={() => setIsCadastroOpen(true)}
            >
              + Nova Entrada
            </button>

            <button
              className={styles.btnSaida}
              onClick={() => setIsSaidaOpen(true)}
            >
              ⬆ Registrar Saída
            </button>
          </div>
        </header>

        <section className={styles.content}>
          <ListaEstoque />
        </section>

        {/* Modais */}
        <ModalCadastro
          isOpen={isCadastroOpen}
          onClose={() => setIsCadastroOpen(false)}
        />

        <ModalSaida
          isOpen={isSaidaOpen}
          onClose={() => setIsSaidaOpen(false)}
        />
      </div>
    </main>
  );
}
