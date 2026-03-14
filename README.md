# Bot CPF 🤖

Um bot inteligente para gerenciamento de dados de pacientes com validação de CPF e integração com IA (Google Gemini).

## 📋 O que é?

O Bot CPF é uma aplicação que permite:
- **Buscar dados de pacientes** pelo CPF
- **Cadastrar novos pacientes** com informações básicas
- **Gerenciar convênios** (planos de saúde)
- **Entender intenções do usuário** através de IA, processando comandos em linguagem natural

O projeto combina uma API REST com um assistente de linha de comando que guia o usuário através de fluxos de conversação estruturados.

## 🏗️ Arquitetura

### Componentes principais:

```
bot_cpf/
├── src/
│   ├── server.js          # API REST Express (porta 3000)
│   ├── graph.js           # Fluxos de conversa com LangGraph
│   ├── tools.js           # Ferramentas/ações disponíveis
│   └── enums/             # Enumerações e constantes
│       ├── choose-flow.enum.js
│       └── convenios.enum.js
├── database.sqlite        # Banco de dados SQLite
└── package.json           # Dependências do projeto
```

### Fluxo de Funcionamento:

1. **CLI (graph.js)** - Interage com o usuário através de prompts no terminal
2. **LangGraph** - Orquestra fluxos de conversação com validações
3. **Express API (server.js)** - Fornece endpoints REST
4. **Google Gemini** - Processa linguagem natural para identificar intenções
5. **SQLite** - Armazena dados de pacientes persistentemente

### Endpoints da API:

- **GET /pacientes?cpf=XXX** - Busca paciente por CPF
- **POST /pacientes** - Cria novo paciente
- **GET /convenio?cpf=XXX** - Obtém convênio do paciente
- **POST /flow** - Processa linguagem natural com IA

## 🚀 Como Instalar

### Pré-requisitos:
- Node.js (v16+)
- npm ou yarn
- Google API Key (para integração com Gemini)

### Passos:

1. **Clone o repositório:**
   ```bash
   git clone <seu-repositorio>
   cd bot_cpf
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto:
   ```
   GOOGLE_API_KEY=sua_chave_aqui
   ```

   Para obter sua chave Google:
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um projeto novo
   - Ative a API "Generative Language API"
   - Crie uma chave de API

4. **Inicie o servidor:**
   ```bash
   # Terminal 1 - Servidor API
   npm run server
   # ou
   node src/server.js
   ```

5. **Em outro terminal, inicie o bot CLI:**
   ```bash
   # Terminal 2 - Bot interativo
   node src/graph.js
   ```

## 💻 Como Usar

### Via CLI (Recomendado):

Execute `node src/graph.js` e siga as instruções interativas:

```
========================================
👋 Olá! Tudo bem?

O que você deseja fazer?

- Buscar dados de um paciente
- Cadastrar um novo paciente

Digite a opção desejada:
```

O bot guiará você através dos passos necessários com validações.

### Via API REST:

```bash
# Buscar paciente
curl "http://localhost:3000/pacientes?cpf=12345678901"

# Criar paciente
curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "nome": "João Silva",
    "convenio": "Unimed"
  }'

# Buscar convênio
curl "http://localhost:3000/convenio?cpf=12345678901"
```

## 📚 Tecnologias Utilizadas

| Tecnologia | Propósito |
|-----------|----------|
| **Express** | Framework web para API REST |
| **LangChain** | Framework para aplicações com IA |
| **LangGraph** | Orquestração de fluxos de conversa |
| **Google Gemini** | Processamento de linguagem natural |
| **SQLite3** | Banco de dados local |
| **Axios** | Cliente HTTP |
| **Zod** | Validação de schemas |
| **cpf-cnpj-validator** | Validação de CPF |

## 🔧 Scripts Disponíveis

No `package.json`, você pode adicionar scripts para facilitar o uso:

```json
"scripts": {
  "server": "node src/server.js",
  "bot": "node src/graph.js",
  "dev": "npm run server & npm run bot"
}
```

## 📦 Estrutura do Banco de Dados

A tabela `pacientes` armazena:

```sql
CREATE TABLE pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf TEXT UNIQUE,           -- CPF do paciente (único)
  nome TEXT,                 -- Nome completo
  convenio TEXT              -- Plano de saúde
);
```

## ⚙️ Validações

- **CPF**: Validado automaticamente antes de qualquer operação
- **Convênio**: Apenas convênios cadastrados na enum são aceitos
- **Duplicação**: CPF duplicado retorna erro ao cadastro

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

---

**Desenvolvido com ❤️**
