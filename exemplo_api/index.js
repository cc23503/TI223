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
    } catch (error) {
        console.error("Erro ao conectar ou consultar o BD:", error);
        return { erro: "Erro ao acessar o banco de dados" };
    }
}
conectaBD();


// rota principal
app.get('/', (req, res) => res.json(
    {mensagem: 'Servidor em execução'}
));


// rota para buscar dados
app.get('/alunos', async (req, res) => {
    const alunos = await mssql.query("SELECT * FROM dbo.aula_aluno");

    res.json(alunos);
    console.log(alunos);
});

app.get('/uf', async (req, res) => {
    const uf = await mssql.query("SELECT * FROM dbo.aula_uf");

    res.json(uf);
    console.log(uf);

});


app.get('/alunos_SP', async (req, res) => {
    const alunos = await mssql.query("SELECT * FROM dbo.aula_aluno WHERE ufAluno = 'SP'")

    res.json(alunos);
    console.log(alunos);

});


app.post('/alunos', (req, res) => {
    try {
        const idAluno = req.body.idAluno;
        const ra = req.body.ra;
        const nomeAluno = req.body.nomeAluno;
        const ufAluno = req.body.ufAluno;

        mssql.query(`INSERT INTO dbo.aula_aluno (idAluno, ra, nomeAluno, ufAluno) VALUES (${idAluno}, ${ra}, '${nomeAluno}', '${ufAluno}')`)
        res.status(201).json({ "mensagem": "Dados inseridos com sucesso."})

    } catch (erro) {
        console.log("Erro na inserção de dados p/ tabela aula_aluno.", erro)
    }
});

app.post('/uf', (req, res) => {
    try {
        const siglauf = req.body.siglauf;
        const nomeUf = req.body.nomeUf;

        mssql.query(`INSERT INTO dbo.aula_uf (siglauf, nomeUf) VALUES ('${siglauf}', '${nomeUf}')`)
        res.status(201).json({"mensagem": "Dados inseridos com sucesso."})

    } catch (erro) {
        console.log("Erro na inserção de dados p/ tabela aula_uf.", erro)
    }

});

// iniciar servidor
app.listen(porta, () => console.log("API Funcionando!"));