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

// 16/09/2025

app.post('/curso', (req, res) => {
    try {
        const codCurso = req.body.codCurso;
        const nomeCurso = req.body.nomeCurso;
        const periodo = req.body.periodo;

        mssql.query(`INSERT INTO dbo.Curso (codCurso, nomeCurso, periodo) VALUES ('${codCurso}', '${nomeCurso}', '${periodo}')`);
        res.status(201).json({"mensagem": "Dados inseridos na tabela 'Curso' com sucesso."});

    } catch (erro) {
        console.log("Erro na inserção dos dados na tabela Curso." + erro)
    }
});

app.delete('/curso/:codCurso', (req, res) => {
    try {
        const codCurso = req.params.codCurso;

        mssql.query(`DELETE FROM dbo.Curso WHERE codCurso = '${codCurso}'`);
        res.status(200).json({"mensagem": "Dados deletados da tabela 'Curso' com sucesso."});
    } catch (erro) {
        console.log("Erro ao realizar exclusão na tabela 'Curso'.");
        res.status(500).json({"mensagem": "Erro interno no servidor."});
    }

});

app.put('/curso/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { codCurso, nomeCurso, periodo } = req.body;

        // Validação básica para garantir que todos os dados necessários estão no corpo da requisição
        if (!codCurso || !nomeCurso || !periodo) {
            return res.status(400).json({ "mensagem": "Dados incompletos. Por favor, forneça codCurso, nomeCurso e periodo." });
        }

        // Exemplo de consulta UPDATE. Use prepared statements para evitar SQL Injection!
        const query = `
            UPDATE dbo.Curso 
            SET codCurso = '${codCurso}', 
                nomeCurso = '${nomeCurso}', 
                periodo = '${periodo}'
            WHERE id = '${id}'
        `;

        const resultado = await mssql.query(query);

        // Verifica se a atualização foi bem-sucedida (se alguma linha foi afetada)
        if (resultado.rowsAffected[0] === 0) {
            return res.status(404).json({ "mensagem": "Curso não encontrado para atualização." });
        }

        res.status(200).json({ "mensagem": "Curso atualizado com sucesso." });
    } catch (erro) {
        console.error("Erro ao atualizar o curso.", erro);
        res.status(500).json({ "mensagem": "Erro interno do servidor." });
    }
});

app.get('/curso-por-id/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const resultado = await mssql.query(`SELECT * FROM dbo.Curso WHERE id = '${id}'`);

        // Verifica se algum curso foi encontrado
        if (resultado.recordset.length === 0) {
            return res.status(404).json({ "mensagem": "Curso não encontrado." });
        }

        res.status(200).json(resultado.recordset[0], {"mensagem": "Sucesso."});
    } catch (erro) {
        console.log("Erro ao realizar busca por ID na tabela 'Curso'.");
        res.status(500).json({"mensagem": "Erro interno no servidor."});
    }

});

app.get('/curso-por-codCurso/:codCurso', async (req, res) => {
    try {
        const codCurso = req.params.codCurso;

        const resultado = await mssql.query(`SELECT * FROM dbo.Curso WHERE codCurso = '${codCurso}'`);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({ "mensagem": "Curso não encontrado." });
        }
        res.status(200).json(resultado.recordset[0], {"mensagem": "Sucesso."});
    } catch (erro) {
        console.log("Erro ao realizar busca pelo Código do Curso na tabela 'Curso'.");
        res.status(500).json({"mensagem": "Erro interno no servidor."});
    }
});


// iniciar servidor
app.listen(porta, () => console.log("API Funcionando!"));