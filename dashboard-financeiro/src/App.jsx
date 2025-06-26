import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./style.css";

export default function App() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("receita");
  const [transacoes, setTransacoes] = useState([]);

  const cores = {
    receita: "#4caf50",
    despesa: "#f44336",
  };

  const adicionarTransacao = async () => {
    if (!descricao || !valor) return alert("Preencha todos os campos");
    await addDoc(collection(db, "transacoes"), {
      descricao,
      valor: parseFloat(valor),
      tipo,
      data: serverTimestamp(),
    });
    setDescricao("");
    setValor("");
    setTipo("receita");
  };

  useEffect(() => {
    const q = query(collection(db, "transacoes"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransacoes(todas);
    });

    return () => unsubscribe();
  }, []);

  const deletarTransacao = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      await deleteDoc(doc(db, "transacoes", id));
    }
  };

  const total = transacoes.reduce(
    (acc, cur) => (cur.tipo === "receita" ? acc + cur.valor : acc - cur.valor),
    0
  );

  const dadosGrafico = [
    {
      name: "Receitas",
      value: transacoes
        .filter((t) => t.tipo === "receita")
        .reduce((acc, cur) => acc + cur.valor, 0),
    },
    {
      name: "Despesas",
      value: transacoes
        .filter((t) => t.tipo === "despesa")
        .reduce((acc, cur) => acc + cur.valor, 0),
    },
  ];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="700"
        fontSize={14}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container">
      <h1>Dashboard Financeiro 💰</h1>
      <p>Controle de Receitas e Despesas 💵💲</p>

      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />
      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="receita">Receita</option>
        <option value="despesa">Despesa</option>
      </select>
      <button onClick={adicionarTransacao}>Adicionar</button>

      <h2>Saldo atual:</h2>
      <p className={`saldo ${total >= 0 ? "positivo" : "negativo"}`}>
        R$ {total.toFixed(2)}
      </p>

      <h2>Todas as transações</h2>
      <ul>
        {transacoes.map((trans) => (
          <li key={trans.id} className={trans.tipo}>
            {trans.descricao} - R$ {trans.valor.toFixed(2)}
            <button
              className="btn-delete"
              onClick={() => deletarTransacao(trans.id)}
              title="Excluir"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <h2>Gráfico</h2>
      <PieChart width={300} height={250}>
        <Pie
          data={dadosGrafico}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={renderLabel}
          labelLine={false}
        >
          <Cell fill={cores.receita} />
          <Cell fill={cores.despesa} />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
