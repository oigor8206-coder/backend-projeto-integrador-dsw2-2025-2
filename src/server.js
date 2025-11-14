// server.js
// -----------------------------------------------------------------------------
// OBJETIVO DESTE ARQUIVO
// -----------------------------------------------------------------------------
// Este arquivo cria uma pequena API REST para gerenciar "encomendas" usando:
// - **Express**: um framework HTTP para Node.js.
// - **PostgreSQL**: um banco de dados relacional, acessado através de um pool de conexões de `./db.js`.
//
// COMO LER ESTE CÓDIGO (para iniciantes):
// - `//` indica um comentário, que não é executado.
// - As palavras-chave `async/await` são usadas para lidar com operações assíncronas, como acessar o banco de dados.
// - Nas rotas, o objeto `req` representa a requisição (o pedido do cliente), e `res` é a resposta do servidor.
// - A função `app.listen(PORT)` no final é o que inicia o servidor HTTP.
//
// CÓDIGOS DE STATUS HTTP USADOS:
// - `200 OK`: A requisição foi bem-sucedida e dados foram retornados.
// - `201 Created`: Um novo recurso foi criado com sucesso.
// - `204 No Content`: A operação foi bem-sucedida, mas não há conteúdo para retornar (comum em exclusões).
// - `400 Bad Request`: O cliente enviou dados inválidos ou mal formatados.
// - `404 Not Found`: O recurso solicitado não foi encontrado no servidor.
// - `500 Internal Server Error`: Ocorreu um erro inesperado no servidor.
//
// SOBRE SEGURANÇA E SQL:
// - Usamos **queries parametrizadas** (`$1`, `$2`, etc.) para proteger contra ataques de **SQL Injection**.
//   Exemplo: `pool.query("SELECT ... WHERE id = $1", [id])`
// - **Nunca** concatene valores vindos do usuário diretamente em strings SQL.
//
// SOBRE JSON:
// - `app.use(express.json())` é um middleware que permite ao Express processar corpos de requisições formatados como JSON, tornando-os acessíveis em `req.body`.
//
// -----------------------------------------------------------------------------
// IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
// -----------------------------------------------------------------------------
import express from "express";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.routes.js"; 
import encomendasRoutes from "./routes/encomendas.routes.js";
import { authMiddleware } from "./middlewares/auth.js";

const app = express();
app.use(cors()); // Habilita CORS para permitir requisições de outros domínios.
app.use(express.json());

app.use(express.json());

// configurar as rotas de usuarios
app.use("/api/usuarios", usuariosRoutes);
//configurar as rotas de usuarios
app.use("/api/encomendas", encomendasRoutes);


// -----------------------------------------------------------------------------
// INICIAR O SERVIDOR
// -----------------------------------------------------------------------------
// A porta é definida por uma variável de ambiente (`process.env.PORT`) ou, como padrão, `3000`.
const PORT = process.env.PORT || 3000;

// O método `app.listen` inicia o servidor HTTP e o faz "escutar" por requisições na porta especificada.
app.listen(PORT, () => console.log(`Servidor rodando em: http://localhost:${PORT}`));