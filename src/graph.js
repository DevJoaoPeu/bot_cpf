import { StateGraph, END, Command } from "@langchain/langgraph";
import readline from "readline";
import {
  buscarConvenio,
  buscarPaciente,
  chooseFlow,
  criarPaciente,
} from "./tools.js";
import { ConveniosLabelEnum } from "./enums/convenios.enum.js";
import { cpf as CPF } from "cpf-cnpj-validator";
import { ChooseFlowEnum } from "./enums/choose-flow.enum.js";

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
    convenio: null,
    resultadoBusca: null,
    convenioValido: null,
    cpfIsValid: null,
    prompt: null,
  },
});

graph.addNode("decidir_flow", async (state) => {
  const prompt = await perguntar(`
    ========================================
    👋 Olá! Tudo bem?

    O que você deseja fazer?

    - Buscar dados de um paciente
    - Cadastrar um novo paciente

    Digite a opção desejada: 
    ========================================
  `);

  const { response } = await chooseFlow.invoke({ prompt });

  return { prompt: response };
});

graph.addNode("pedir_cpf", async (state) => {
  const cpf = await perguntar("Digite seu CPF (apenas números): ");

  const cpfIsValid = CPF.isValid(cpf);

  if (!cpfIsValid) {
    console.log("❌ CPF inválido. Tente novamente.");
  }

  return { cpf, cpfIsValid };
});

graph.addNode("buscar", async (state) => {
  const resultado = await buscarPaciente.invoke({
    cpf: state.cpf,
  });

  return { resultadoBusca: resultado };

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

graph.addNode("pedir_convenio", async (state) => {
  const conveniosOptions = Object.values(ConveniosLabelEnum);

  const convenio = await perguntar(
    `Digite seu convênio (${conveniosOptions.join(", ")}): `,
  );

  const valido = conveniosOptions.includes(convenio);

  if (!valido) {
    console.log("❌ Convênio inválido.");
  }

  return { convenio, convenioValido: valido };
});

graph.addNode("criar", async (state) => {
  await criarPaciente.invoke({
    cpf: state.cpf,
    nome: state.nome,
    convenio: state.convenio,
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

graph.setEntryPoint("decidir_flow");
graph.addEdge("buscar", "verificar");

graph.addConditionalEdges(
  "decidir_flow",
  (state) => {
    const condition =
      state.prompt === ChooseFlowEnum.CREATE_PATIENT ||
      state.prompt === ChooseFlowEnum.SEARCH_PATIENT;

    if (condition) return "pedir_cpf";
    
    // if (state.prompt === ChooseFlowEnum.SEARCH_CONVENIO) {
    //   return "pedir_cpf";
    // }

    console.log("❌ Opção inválida, tente novamente.");

    return "decidir_flow";
  },
  {
    // buscar_convenio: "buscar_convenio",
    pedir_cpf: "pedir_cpf",
    decidir_flow: "decidir_flow",
  },
);

graph.addConditionalEdges(
  "verificar",
  (state) => {
    if (state.resultadoBusca.exists) {
      return "buscar_convenio";
    }
    return "pedir_nome";
  },
  {
    pedir_nome: "pedir_nome",
    buscar_convenio: "buscar_convenio",
  },
);

graph.addConditionalEdges(
  "pedir_convenio",
  (state) => {
    if (!state.convenioValido) return "pedir_convenio";
    return "proximo_node";
  },
  {
    pedir_convenio: "pedir_convenio",
    proximo_node: "criar",
  },
);

graph.addConditionalEdges(
  "pedir_cpf",
  (state) => {
    if (!state.cpfIsValid) return "pedir_cpf";
    return "proximo_node";
  },
  {
    pedir_cpf: "pedir_cpf",
    proximo_node: "buscar",
  },
);

graph.addEdge("buscar_convenio", END);
graph.addEdge("pedir_nome", "pedir_convenio");

const app = graph.compile();

await app.invoke({});
rl.close();
