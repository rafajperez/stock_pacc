import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from "./Header.module.scss";
export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redireciona para a tela que você já criou
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span>PACC</span>
        <h1>Estoque</h1>
      </div>
      <button onClick={handleLogout} className={styles.btnLogout}>
        Sair do Sistema
      </button>
    </header>
  );
}
