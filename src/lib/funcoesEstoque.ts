import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const fecharMesHistorico = async (historicoAtual: any[]) => {
  if (historicoAtual.length === 0) {
    toast.error("O histórico já está vazio.");
    return;
  }

  const confirmacao = window.prompt(
    "Para fechar o mês e limpar o histórico, digite FECHAR abaixo:",
  );

  if (confirmacao !== "FECHAR") {
    toast.error("Ação cancelada ou palavra incorreta.");
    return;
  }

  const loadingToast = toast.loading("Arquivando dados...");

  try {
    const dataAtual = new Date();

    const mesAno = format(dataAtual, "MMMM-yyyy", { locale: ptBR });

    await addDoc(collection(db, "arquivos_mensais"), {
      mesAno: mesAno,
      dados: historicoAtual,
      dataFechamento: serverTimestamp(),
      responsavel: auth.currentUser?.email, // Guarda quem fechou o mês
    });

    const batch = writeBatch(db);
    const querySnapshot = await getDocs(collection(db, "historico_saidas"));

    querySnapshot.forEach((documento) => {
      batch.delete(doc(db, "historico_saidas", documento.id));
    });

    await batch.commit();

    toast.success("Mês encerrado e histórico limpo!", { id: loadingToast });
    window.location.reload();
  } catch (error) {
    console.error(error);
    toast.error("Erro técnico ao fechar mês.", { id: loadingToast });
  }
};
