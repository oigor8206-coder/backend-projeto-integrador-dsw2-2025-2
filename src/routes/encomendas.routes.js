// src/routes/encomendas.routes.js
import { Router } from "express";
import { unlink } from 'node:fs/promises'; // unlink do fs para apagar arquivo
import { pool } from "../database/db.js";
import multer from "multer"; // import do multer
import path from "path";     // import do path
import fs from "fs";         // import do fs

const router = Router();

// setup mínimo de upload em disco
const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

//get api/encomendas/
router.get("/", async (_req, res) => {
    try {
        // Desestruturamos o objeto retornado para extrair a propriedade `rows`.
        const { rows } = await pool.query(`SELECT * FROM "Encomendas" ORDER BY "id" DESC`);
        res.json(rows); // Retorna um array de objetos, onde cada objeto representa uma encomenda.
    } catch {
        res.status(500).json({ erro: "erro interno" });
    }
});

// -----------------------------------------------------------------------------
// MOSTRAR UM (GET /api/encomendas/:id)
// -----------------------------------------------------------------------------
// Esta rota busca uma encomenda específica pelo seu ID.
// Parâmetros de rota (como `:id`) são sempre strings, então precisamos convertê-los.
router.get("/:id", async (req, res) => {
    // Converte o ID de string para número.
    const id = Number(req.params.id);

    // Valida o ID: deve ser um número inteiro positivo.
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id inválido" });
    }

    try {
        // Consulta parametrizada: o valor de `id` substitui `$1`.
        const result = await pool.query(`SELECT * FROM "Encomendas" WHERE "id" = $1`, [id]);

        // `rows` é um array de linhas. Se o primeiro elemento não existe, a encomenda não foi encontrada.
        const { rows } = result;
        if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

        // Retorna a primeira (e única) encomenda encontrada.
        res.json(rows[0]);
    } catch {
        res.status(500).json({ erro: "erro interno" });
    }
});

// -----------------------------------------------------------------------------
// CRIAR (POST /encomendas)
// -----------------------------------------------------------------------------
// Esta rota insere uma nova encomenda no banco de dados.
// É esperado um corpo de requisição JSON com os dados necessários.
// Usamos `?? {}` para garantir que `req.body` seja um objeto, mesmo que o corpo esteja vazio.
router.post("post/", async (req, res) => {
    // Extrai os campos do corpo da requisição e converte os valores numéricos.
    const { usuarios_id, material, chumbo, peso_laco, cor } = req.body ?? {};
    const user_id = Number(usuarios_id);
    const c = Number(chumbo);
    const peso = Number(peso_laco);

    console.log(req.body);

    // Validação dos dados recebidos.
    if (!material || typeof (material) !== 'string' ||
        !cor || typeof (cor) !== 'string' ||
        usuarios_id == null || Number.isNaN(user_id) || user_id < 1 ||
        chumbo == null || Number.isNaN(c) || c < 0 ||
        peso_laco == null || Number.isNaN(peso) || peso < 0) {
        return res.status(400).json({ erro: "Dados obrigatórios inválidos" });
    }

    try {
        // Executa o INSERT e usa `RETURNING *` para obter a linha recém-criada.
        const { rows } = await pool.query(
            `INSERT INTO "Encomendas" ("usuarios_id", "material", "chumbo", "peso_laco", "cor") VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, material, c, peso, cor]
        );

        // `rows[0]` contém o objeto da encomenda que acabou de ser inserida.
        res.status(201).json(rows[0]); // Retorna 201 Created.
    } catch {
        res.status(500).json({ erro: "erro interno" });
    }
});

// -----------------------------------------------------------------------------
// SUBSTITUIR (PUT /encomendas/:id)
// -----------------------------------------------------------------------------
// Esta rota substitui todos os campos de uma encomenda existente.
// O cliente deve enviar o recurso completo no corpo da requisição.
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { usuarios_id, material, chumbo, peso_laco, cor } = req.body ?? {};
    const user_id = Number(usuarios_id);
    const c = Number(chumbo);
    const peso = Number(peso_laco);

    // Valida o ID da rota.
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id inválido" });
    }

    // Valida os dados do corpo.
    if (!material || typeof (material) !== 'string' ||
        !cor || typeof (cor) !== 'string' ||
        usuarios_id == null || Number.isNaN(user_id) || user_id < 1 ||
        chumbo == null || Number.isNaN(c) || c < 0 ||
        peso_laco == null || Number.isNaN(peso) || peso < 0) {
        return res.status(400).json({ erro: "Dados obrigatórios inválidos" });
    }

    try {
        // Atualiza todos os campos da encomenda.
        const { rows } = await pool.query(
            `UPDATE "Encomendas" SET 
                "usuarios_id" = $1,
                "material" = $2,
                "chumbo" = $3,
                "peso_laco" = $4,
                "cor" = $5
            WHERE "id" = $6
            RETURNING *`,
            [user_id, material, c, peso, cor, id]
        );

        // Se nenhuma linha foi atualizada, significa que o ID não existe.
        if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

        res.json(rows[0]); // Retorna a encomenda atualizada.
    } catch (error) {
        // Retorna o erro específico em caso de falha.
        res.status(500).json({ erro: error.message });
    }
});

// -----------------------------------------------------------------------------
// ATUALIZAR PARCIALMENTE (PATCH /encomendas/:id)
// -----------------------------------------------------------------------------
// Esta rota atualiza apenas os campos que são enviados na requisição.
// A função `COALESCE` do SQL é usada para manter os valores antigos se um campo não for fornecido.
// `COALESCE(a, b)` retorna `a` se `a` não for nulo; caso contrário, retorna `b`.
router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { usuarios_id, material, chumbo, peso_laco, cor } = req.body ?? {};

    // Validação do ID da rota.
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id inválido" });
    }

    // Se nenhum campo foi fornecido, não há o que atualizar.
    if (usuarios_id === undefined &&
        material === undefined &&
        chumbo === undefined &&
        peso_laco === undefined &&
        cor === undefined
    ) {
        return res.status(400).json({ erro: "É necessário enviar pelo menos um dado para atualizar" });
    }

    // Validação dos dados numéricos.
    let c = null;
    if (chumbo !== undefined) {
        c = Number(chumbo);
        if (Number.isNaN(c) || c < 0) {
            return res.status(400).json({ erro: "chumbo deve ser um número maior ou igual a 0" });
        }
    }

    let peso = null;
    if (peso_laco !== undefined) {
        peso = Number(peso_laco);
        if (Number.isNaN(peso) || peso < 0) {
            return res.status(400).json({ erro: "peso deve ser um número maior ou igual a 0" });
        }
    }

    let user_id = null;
    if (usuarios_id !== undefined) {
        user_id = Number(usuarios_id);
        if (Number.isNaN(user_id) || user_id < 1) {
            return res.status(400).json({ erro: "usuario_id deve ser um número maior ou igual a 1" });
        }
    }

    try {
        // A consulta SQL usa `COALESCE` para atualizar apenas os campos que não são nulos.
        // Se um campo como `material` for `undefined` no corpo da requisição, ele é passado como `null` para o SQL.
        // `COALESCE($2, material)` então irá manter o valor original de `material` no banco de dados.
        const { rows } = await pool.query(
            `UPDATE "Encomendas" SET
                "usuarios_id" = COALESCE($1, "usuarios_id"), 
                "material" = COALESCE($2, "material"), 
                "chumbo" = COALESCE($3, "chumbo"), 
                "peso_laco" = COALESCE($4, "peso_laco"),
                "cor" = COALESCE($5, "cor")
            WHERE "id" = $6 RETURNING *`,
            [user_id ?? null, material ?? null, c ?? null, peso ?? null, cor ?? null, id]
        );

        if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
        res.json(rows[0]);
    } catch {
        res.status(500).json({ erro: "erro interno" });
    }
});

// -----------------------------------------------------------------------------
// DELETAR (DELETE /encomendas/:id)
// -----------------------------------------------------------------------------
// Esta rota remove uma encomenda do banco de dados.
// Retorna o status `204 No Content` em caso de sucesso, indicando que a operação foi bem-sucedida, mas não há dados para retornar.
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    // Validação do ID da rota.
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id inválido" });
    }

    try {
        // A consulta `DELETE ... RETURNING id` nos permite saber se alguma linha foi afetada.
        const r = await pool.query(`DELETE FROM "Encomendas" WHERE "id" = $1 RETURNING "id"`, [id]);

        // `r.rowCount` é o número de linhas que foram excluídas. Se for 0, o ID não existe.
        if (r.rowCount === 0) return res.status(404).json({ erro: "não encontrado" });

        res.status(204).end(); // Retorna o status 204. O método `.end()` encerra a resposta sem enviar corpo.
    } catch {
        res.status(500).json({ erro: "erro interno" });
    }
});
export default router;