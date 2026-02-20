"use client";

import { useState } from "react";
import ListaEstoque from "@/components/ListaEstoque";
import ModalCadastro from "@/components/ModalCadastro";
import ModalSaida from "@/components/ModalSaida";
import styles from "./estoque.module.scss";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import LogoutIcon from "@mui/icons-material/Logout";

export default function EstoquePage() {
  const router = useRouter();
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);

  const handleLogout = () => {
    toast(
      (t) => (
        <span>
          Deseja realmente sair?
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await signOut(auth);
                router.push("/login");
                toast.success("Até logo!");
              } catch (error) {
                toast.error("Erro ao sair");
              }
            }}
            style={{
              marginLeft: "10px",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </span>
      ),
      { duration: 5000 },
    );
  };

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image
              src="/Logo-PACC-NOVA.png"
              alt="Logo PACC"
              width={45}
              height={40}
              priority
            />
            <h1>Estoque PACC</h1>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.buttonGroup}>
              <button
                className={styles.btnEntrada}
                onClick={() => setIsCadastroOpen(true)}
              >
                <AddCircleOutlineIcon fontSize="small" />
                Nova Entrada
              </button>

              <button
                className={styles.btnSaida}
                onClick={() => setIsSaidaOpen(true)}
              >
                <RemoveCircleOutlineIcon fontSize="small" />
                Registrar Saída
              </button>
            </div>

            <button onClick={handleLogout} className={styles.btnLogout}>
              <LogoutIcon fontSize="small" />
              Sair
            </button>
          </div>
        </header>

        <section className={styles.content}>
          <ListaEstoque />
        </section>

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
