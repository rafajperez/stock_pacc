"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import styles from "./config.module.scss";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import toast from "react-hot-toast";
import ConsumoChart from "@/components/ConsumoChart/ConsumoChart";
import {
  fecharMesHistorico,
  exportarParaPDF,
  exportarEstoqueParaCSV,
} from "@/lib/funcoesEstoque";

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("historico");
  const { user, loading } = useAuth();
  const [historico, setHistorico] = useState([]);

  // Monitora o banco de dados para listar o histórico em tempo real
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "historico_saidas"));
    return onSnapshot(q, (snap) => {
      setHistorico(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any,
      );
    });
  }, [user]);

  /**
   * handleFechamento: Ação crítica para arquivar dados.
   * 1. Usa prompt do navegador para segurança extra.
   * 2. Usa Toast para feedback visual de progresso.
   */
  const handleFechamento = async () => {
    // 1. Verifica se há algo para apagar
    if (historico.length === 0) {
      toast.error("Não há dados para fechar.");
      return;
    }

    // 2. Abre a caixa de texto do navegador (Prompt)
    const confirmacao = prompt(
      "Para confirmar o fechamento e arquivamento do histórico, digite FECHAR abaixo:",
    );

    // 3. Só prossegue se o usuário digitou exatamente a palavra
    if (confirmacao?.toUpperCase() === "FECHAR") {
      const idToast = toast.loading("Arquivando histórico...");

      try {
        // Executa a função do Firebase (deve deletar/mover os documentos)
        await fecharMesHistorico(historico);

        // Sucesso: transforma o loading em check verde
        toast.success("Mês encerrado com sucesso!", { id: idToast });
      } catch (error) {
        console.error("Erro no fechamento:", error);
        // Erro: transforma o loading em erro vermelho
        toast.error("Erro ao realizar fechamento.", { id: idToast });
      }
    } else if (confirmacao !== null) {
      // Se ele digitou qualquer outra coisa e não clicou em "Cancelar"
      toast.error("Palavra incorreta. Ação cancelada.");
    }
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  // Processando os dados do histórico para o gráfico

  const dadosFormatados = historico
    .reduce((acc: any[], atual: any) => {
      const nomeItem = atual.itemNome || atual.nome || "Desconhecido";
      const quantidade = Number(atual.quantidade) || 0;

      const encontrado = acc.find((i) => i.name === nomeItem);
      if (encontrado) {
        encontrado.total += quantidade;
      } else {
        acc.push({ name: nomeItem, total: quantidade });
      }
      return acc;
    }, [])
    .sort((a, b) => b.total - a.total) // Ordena do maior para o menor
    .slice(0, 10); // Pega apenas o Top 10 para não poluir o gráfico
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* Cabeçalho do Painel */}
        <header className={styles.header}>
          <Link href="/estoque" className={styles.btnVoltar}>
            <ArrowBackIcon fontSize="small" /> Voltar ao Estoque
          </Link>
          <h1>
            <SettingsIcon /> Painel Administrativo
          </h1>
        </header>

        {/* Abas de Navegação */}
        <nav className={styles.tabs}>
          <button
            className={activeTab === "historico" ? styles.active : ""}
            onClick={() => setActiveTab("historico")}
          >
            <HistoryIcon /> Histórico de Saídas
          </button>
          <button
            className={activeTab === "graficos" ? styles.active : ""}
            onClick={() => setActiveTab("graficos")}
          >
            <BarChartIcon /> Gráficos
          </button>
          <button
            className={activeTab === "fechamento" ? styles.active : ""}
            onClick={() => setActiveTab("fechamento")}
          >
            <AssessmentIcon /> Fechamento de Mês
          </button>
        </nav>

        {/* Conteúdo Dinâmico */}
        <div className={styles.tabContent}>
          {/* ABA: HISTÓRICO */}
          {activeTab === "historico" && (
            <section className={styles.sectionHistorico}>
              <div className={styles.sectionHeader}>
                <h2>Histórico de Saídas</h2>
                <span className={styles.badge}>
                  {historico.length} registros
                </span>
              </div>

              <div className={styles.tabelaContainer}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Item</th>
                      <th>Qtd</th>
                      <th>Paciente / Destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.length > 0 ? (
                      historico
                        .sort(
                          (a: any, b: any) =>
                            (b.dataSaida?.seconds || 0) -
                            (a.dataSaida?.seconds || 0),
                        )
                        .map((item: any) => (
                          <tr key={item.id}>
                            <td>
                              {item.dataSaida
                                ? new Date(
                                    item.dataSaida.seconds * 1000,
                                  ).toLocaleDateString("pt-BR")
                                : "---"}
                            </td>
                            <td className={styles.nomeItem}>
                              {item.itemNome || item.nome || "Item s/ nome"}
                            </td>
                            <td>
                              <strong>{item.quantidade}</strong>
                            </td>
                            <td>
                              {item.pacienteReferencia ||
                                item.destino ||
                                "Não informado"}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className={styles.emptyMessage}>
                          Nenhuma saída registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ABA: GRÁFICOS */}

          {activeTab === "graficos" && (
            <section className={styles.sectionGraficos}>
              <div
                className={styles.sectionHeader}
                style={{ marginBottom: "20px" }}
              >
                <h2>Análise de Movimentação</h2>
                <p>Visualização baseada nas saídas registradas no mês.</p>
              </div>

              {historico.length > 0 ? (
                <ConsumoChart data={dadosFormatados} />
              ) : (
                <div className={styles.emptyMessage}>
                  Nenhum dado de saída disponível para gerar o gráfico.
                </div>
              )}
            </section>
          )}
          {/* ABA: FECHAMENTO */}
          {activeTab === "fechamento" && (
            <section className={styles.sectionFechamento}>
              <div className={styles.cardAviso}>
                <h3>
                  <span>⚠️ Atenção: Área Administrativa</span>
                </h3>
                <p>
                  As ações abaixo limpam os registros mensais. Certifique-se de
                  exportar os dados antes.
                </p>
              </div>

              <div className={styles.gridAcoes}>
                {/* Exportação */}
                <div className={styles.cardAcao}>
                  <h4>Relatórios</h4>
                  <p>Baixe o histórico atual para prestação de contas.</p>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexDirection: "column",
                    }}
                  >
                    <button
                      className={styles.btnExportar}
                      onClick={() => exportarParaPDF(historico)}
                    >
                      Exportar em PDF (Para Impressão)
                    </button>
                    <button
                      className={styles.btnExportar}
                      onClick={() => exportarEstoqueParaCSV(historico)}
                    >
                      Exportar em CSV (Para Excel)
                    </button>
                  </div>
                </div>

                {/* Fechamento */}
                <div className={styles.cardAcao}>
                  <h4>Fechamento Mensal</h4>
                  <p>Arquiva as saídas e limpa esta tela para o novo mês.</p>
                  <button
                    className={styles.btnDanger}
                    onClick={handleFechamento}
                  >
                    Realizar Fechamento
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
