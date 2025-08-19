require("dotenv").config();

const porta = process.env.PORTA;
const stringSQL = process.env.CONNECTION_STRING;
const express = require('express');
const app = express();
const mssql = require('mssql');

console.log("PORTA:", porta);

app.use(express.json());

async function conectaBD() {
    try {
        await mssql.connect(stringSQL); // aguarda o retorno do BD
        const result = await mssql.query("SELECT * FROM dbo.aula_aluno");
        await mssql.close(); // Fecha a conexão depois de usar
        return result.recordset;
    } catch (error) {
        console.error("Erro ao conectar ou consultar o BD:", error);
        return { erro: "Erro ao acessar o banco de dados" };
    }
}


// rota principal
app.get('/', (req, res) => res.json(
    {mensagem: 'Servidor em execução'}
));

// rota para buscar dados
app.get('/dados', async (req, res) => {
    const dados = await conectaBD(); // aguarda o retorno do BD
    res.json(dados);
});

// iniciar servidor
app.listen(porta, () => console.log("API Funcionando!"));