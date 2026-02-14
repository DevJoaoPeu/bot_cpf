import { StateGraph, END } from "@langchain/langgraph";
import readline from "readline";
import { buscarConvenio, buscarPaciente, criarPaciente } from "./tools.js";
import { ConveniosLabelEnum } from "./enums/convenios.enum.js";

function validarCPF(cpf) {
  return /^\d{11}$/.test(cpf);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta) {
  return new Promise((resolve) => {
    rl.question(pergunta, resolve);
  });
}

const graph = new StateGraph({
  channels: {
    cpf: null,
    nome: null,
    resultadoBusca: null,
  },
});

graph.addNode("pedir_cpf", async (state) => {
  const cpf = await perguntar("Digite seu CPF (apenas números): ");

  if (!validarCPF(cpf)) {
    console.log("CPF inválido. Tente novamente.");
    return {};
  }

  return { cpf };
});

graph.addNode("buscar", async (state) => {
  let tentativas = 0;

  while (tentativas < 3) {
    try {
      const resultado = await buscarPaciente.invoke({
        cpf: state.cpf,
      });

      return { resultadoBusca: resultado };
    } catch (err) {
      tentativas++;
      console.log("Erro ao buscar. Tentando novamente...");
    }
  }

  throw new Error("Falha após 3 tentativas.");
});

graph.addNode("verificar", async (state) => {
  if (state.resultadoBusca.exists) {
    console.log("✅ Usuário cadastrado!");
  } else {
    console.log("Usuário não encontrado.");
  }

  return {}; 
});

graph.addNode("pedir_nome", async (state) => {
  const nome = await perguntar("Digite seu nome para cadastro: ");
  return { nome };
});

graph.addNode("criar", async (state) => {
  await criarPaciente.invoke({
    cpf: state.cpf,
    nome: state.nome,
    convenio: ConveniosLabelEnum.UNIMED
  });

  console.log("🎉 Cadastro realizado com sucesso!");
  return {};
});

graph.addNode("buscar_convenio", async (state) => {
  const { convenio } = await buscarConvenio.invoke({
    cpf: state.cpf,
  });

  console.log(`Seu cpf é ${state.cpf} e seu convênio é ${convenio}`);
  return {};
});

graph.setEntryPoint("pedir_cpf");

graph.addEdge("pedir_cpf", "buscar");
graph.addEdge("buscar", "verificar");

graph.addConditionalEdges(
  "verificar",
  (state) => {
    if (state.resultadoBusca.exists) {
      return 'buscar_convenio';
    }
    return "pedir_nome";
  },
  {
    pedir_nome: "pedir_nome",
    buscar_convenio: 'buscar_convenio',
  }
);

graph.addEdge("buscar_convenio", END);
graph.addEdge("pedir_nome", "criar");

const app = graph.compile();

await app.invoke({});
rl.close();
