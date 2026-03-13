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

// --- FUNÇÃO 1: FECHAR MÊS ---
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
      responsavel: auth.currentUser?.email,
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

// --- FUNÇÃO 2: EXPORTAR BACKUP CSV ---
export const exportarEstoqueParaCSV = (itensEstoque: any[]) => {
  if (!itensEstoque || itensEstoque.length === 0) {
    toast.error("Não há dados para exportar.");
    return;
  }

  try {
    const cabecalho = "Item,Quantidade,Categoria\n";
    const linhas = itensEstoque
      .map(
        (item) =>
          `"${item.nome}",${item.quantidade},"${item.categoria || "Geral"}"`,
      )
      .join("\n");

    // O prefixo \uFEFF força o Excel a reconhecer a codificação UTF-8 (acentos)
    const csvContent = "\uFEFF" + cabecalho + linhas;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `estoque_pacc_${new Date().toLocaleDateString("pt-BR")}.csv`,
    );
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    toast.success("Backup baixado com sucesso!");
  } catch (error) {
    console.error("Erro no backup:", error);
    toast.error("Erro ao gerar arquivo de backup.");
  }
};
