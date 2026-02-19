"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Avisa o Firebase para encerrar a sessão
      router.push("/login"); // Manda o usuário de volta para o login
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 16px",
        backgroundColor: "#e74c3c", // Um vermelho para indicar ação de sair
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Sair do Sistema
    </button>
  );
}
