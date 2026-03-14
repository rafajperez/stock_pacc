import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- FUNÇÃO 1: FECHAR MÊS (Focada em Firestore) ---
export const fecharMesHistorico = async (historicoAtual: any[]) => {
  // Removi o prompt daqui pois ele já é feito na Page
  const dataAtual = new Date();
  const mesAno = format(dataAtual, "MMMM-yyyy", { locale: ptBR });

  // 1. Salva o backup no Firestore
  await addDoc(collection(db, "arquivos_mensais"), {
    mesAno: mesAno,
    dados: historicoAtual,
    dataFechamento: serverTimestamp(),
    responsavel: auth.currentUser?.email,
  });

  // 2. Deleta os registros atuais em lote (Batch)
  const batch = writeBatch(db);
  const querySnapshot = await getDocs(collection(db, "historico_saidas"));

  querySnapshot.forEach((documento) => {
    batch.delete(doc(db, "historico_saidas", documento.id));
  });

  return await batch.commit(); // Retorna a promessa para ser tratada pelo Toast da Page
};

// --- FUNÇÃO 2: EXPORTAR BACKUP CSV (Otimizado para Excel BR) ---
export const exportarEstoqueParaCSV = (itensEstoque: any[]) => {
  if (!itensEstoque || itensEstoque.length === 0) {
    toast.error("Não há dados para exportar.");
    return;
  }

  try {
    // Usando ; como separador, que é o padrão do Excel brasileiro
    const cabecalho = "Data;Item;Quantidade;Paciente_Destino\n";
    const linhas = itensEstoque
      .map((item) => {
        const data = item.dataSaida
          ? new Date(item.dataSaida.seconds * 1000).toLocaleDateString("pt-BR")
          : "";
        const nome = item.itemNome || item.nome || "S/ nome";
        const qtd = item.quantidade;
        const destino = item.pacienteReferencia || item.destino || "N/I";

        return `${data};"${nome}";${qtd};"${destino}"`;
      })
      .join("\n");

    const csvContent = "\uFEFF" + cabecalho + linhas;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `estoque_pacc_${format(new Date(), "dd-MM-yyyy")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Backup CSV baixado!");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao gerar CSV.");
  }
};

// --- FUNÇÃO 3: EXPORTAR PARA PDF (Sua versão que está ótima!) ---
export const exportarParaPDF = (historico: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("PACC - Relatório de Fechamento Mensal", 14, 20);

  doc.setFontSize(11);
  doc.text(
    `Data do Relatório: ${new Date().toLocaleDateString("pt-BR")}`,
    14,
    30,
  );

  const tableRows = historico.map((item) => [
    item.dataSaida
      ? new Date(item.dataSaida.seconds * 1000).toLocaleDateString("pt-BR")
      : "---",
    item.itemNome || item.nome || "Item s/ nome",
    item.quantidade,
    item.pacienteReferencia || item.destino || "Não informado",
  ]);

  autoTable(doc, {
    head: [["Data", "Item", "Qtd", "Paciente / Destino"]],
    body: tableRows,
    startY: 35,
    theme: "grid",
    headStyles: { fillColor: [0, 51, 102] },
    styles: { fontSize: 9 },
  });

  doc.save(`fechamento_pacc_${format(new Date(), "MM_yyyy")}.pdf`);
};
