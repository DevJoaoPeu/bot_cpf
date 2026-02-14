import express from "express"
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bodyParser from 'body-parser'

const app = express()
app.use(bodyParser.json())

const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
})

await db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cpf TEXT UNIQUE,
        nome TEXT,
        convenio TEXT
  );  
`)

app.get("/pacientes", async (req, res) => {
  const { cpf } = req.query;

  const user = await db.get(
    "SELECT * FROM pacientes WHERE cpf = ?",
    cpf
  );

  if (user) {
    return res.json({ exists: true, user });
  }

  return res.json({ exists: false });
});

app.post("/pacientes", async (req, res) => {
  const { cpf, nome, convenio } = req.body;

  try {
    await db.run(
      "INSERT INTO pacientes (cpf, nome, convenio) VALUES (?, ?, ?)",
      cpf,
      nome,
      convenio
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: "CPF já cadastrado" });
  }
});

app.get("/convenio", async (req, res) => {
  const { cpf } = req.query;

  try {
    const user = await db.get(
      "SELECT * FROM pacientes WHERE cpf = ?",
      cpf
    );

    if (!user) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    return res.json({ convenio: user.convenio });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar convênio" });
  }
});

app.listen(3000, () =>
  console.log("🚀 API rodando em http://localhost:3000")
);