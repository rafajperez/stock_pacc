"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from "./Header.module.scss";
import Link from "next/link";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import LogoutIcon from "@mui/icons-material/Logout";
import toast from "react-hot-toast";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
      toast.success("Até logo!");
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast.error("Erro ao sair do sistema");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span>PACC</span>
        <h1>Estoque</h1>
      </div>

      <div className={styles.actions}>
        <Link href="/config" title="Painel Administrativo">
          <div className={styles.config}>
            <SettingsApplicationsIcon />
          </div>
        </Link>

        <button onClick={handleLogout} className={styles.btnLogout}>
          <LogoutIcon fontSize="small" /> Sair do Sistema
        </button>
      </div>
    </header>
  );
}
