import axios from "axios";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'Connection': 'keep-alive'
  }
});

export const buscarPaciente = tool(
  async ({ cpf }) => {
    const response = await axiosInstance.get(
      `http://localhost:3000/pacientes?cpf=${cpf}`
    );

    return response.data;
  },
  {
    name: "buscar_paciente",
    description: "Busca paciente pelo CPF",
    schema: z.object({
      cpf: z.string(),
    }),
  }
);

export const criarPaciente = tool(
  async ({ cpf, nome, convenio }) => {
    const response = await axiosInstance.post(
      "http://localhost:3000/pacientes",
      { cpf, nome, convenio }
    );

    return response.data;
  },
  {
    name: "criar_paciente",
    description: "Cria um novo paciente",
    schema: z.object({
      cpf: z.string(),
      nome: z.string(),
      convenio: z.string(),
    }),
  }
);

export const buscarConvenio = tool(
  async ({ cpf }) => {
    const response = await axiosInstance.get(
      `http://localhost:3000/convenio?cpf=${cpf}`
    );

    return response.data;
  },
  {
    name: "buscar_convenio",
    description: "Buscar convenio",
    schema: z.object({
      cpf: z.string(),
    }),
  }
);

export const chooseFlow = tool(
  async ({ prompt }) => {
    const response = await axiosInstance.post(
      `http://localhost:3000/flow`,
      { prompt }
    );

    return response.data;
  },
  {
    name: "buscar_convenio",
    description: "Buscar convenio",
    schema: z.object({
      prompt: z.string(),
    }),
  }
);
