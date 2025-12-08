-- Este script, convertido para PostgreSQL, cria as tabelas para o sistema de encomendas.
-- Inclui uma função e triggers para atualizar automaticamente os timestamps de modificação.

-- -----------------------------------------------------
-- Limpeza de Tabelas Existentes
-- Garante que o script possa ser executado várias vezes sem erros.
-- -----------------------------------------------------
DROP TABLE IF EXISTS "Encomendas";
DROP TABLE IF EXISTS "Usuarios";

-- -----------------------------------------------------
-- Tabela Usuario
-- Armazena as informações dos usuários do sistema.
-- -----------------------------------------------------
CREATE TABLE "Usuarios" (
"id"                SERIAL PRIMARY KEY, -- 'SERIAL' é o tipo auto-incremento do PostgreSQL
"nome"              VARCHAR(255) NOT NULL, -- Nome completo do usuário
"email"             VARCHAR(255) UNIQUE NOT NULL, -- Endereço de e-mail único
"senha_hash"        VARCHAR(255) NOT NULL, -- Senha do usuário armazenada de forma segura
"papel"             SMALLINT NOT NULL CHECK ("papel" IN (0, 1)),
"data_criacao"      TIMESTAMP DEFAULT NOW(), -- Data de criação com fuso horário
"data_atualizacao"  TIMESTAMP DEFAULT NOW() -- Data de atualização com fuso horário
);

-- -----------------------------------------------------
-- Tabela Encomenda
-- Armazena os detalhes das encomendas feitas pelos usuários.
-- -----------------------------------------------------
CREATE TABLE "Encomendas" (
  "id"                SERIAL PRIMARY KEY, -- Identificador único para cada encomenda
  "usuarios_id"       INT NOT NULL REFERENCES "Usuarios"("id"), -- Chave estrangeira referenciando o usuário
  "material"          VARCHAR(50) NOT NULL, -- Tipo de material da encomenda
  "chumbo"            INT NOT NULL, -- Especificação do chumbo
  "peso_laco"         DECIMAL(10, 2), -- Peso do laço, campo opcional
  "cor"               VARCHAR(50) NOT NULL, -- Cor do produto encomendado
  "observacoes"      VARCHAR(250), -- Campo para observações adicionais, opcional
  "data_criacao"      TIMESTAMP DEFAULT NOW(), -- Data de criação com fuso horário
  "data_atualizacao"  TIMESTAMP DEFAULT NOW() -- Data de atualização com fuso horário
);

-- -----------------------------------------------------
-- Inserção de Dados de Exemplo
-- -----------------------------------------------------

-- Inserção na tabela Usuarios
INSERT INTO "Usuarios" ("nome", "email", "senha_hash", "papel") VALUES
('Ana Souza', 'ana@exemplo.com', '$2a$10$hash_exemplo_1', 0),
('Carlos Silva', 'carlos@exemplo.com', '$2a$10$hash_exemplo_2', 1),
('Beatriz Costa', 'bia@exemplo.com', '$2a$10$hash_exemplo_3', 0),
('Daniel Martins', 'daniel@exemplo.com', '$2a$10$hash_exemplo_4', 1),
('Eduarda Lima', 'duda@exemplo.com', '$2a$10$hash_exemplo_5', 0),
('Fábio Pereira', 'fabio@exemplo.com', '$2a$10$hash_exemplo_6', 0),
('Gabriela Nunes', 'gabi@exemplo.com', '$2a$10$hash_exemplo_7', 0),
('Heitor Almeida', 'heitor@exemplo.com', '$2a$10$hash_exemplo_8', 1),
('Isabela Barros', 'isa@exemplo.com', '$2a$10$hash_exemplo_9', 0),
('João Ricardo', 'joao@exemplo.com', '$2a$10$hash_exemplo_10', 0),
('Larissa Mendes', 'lari@exemplo.com', '$2a$10$hash_exemplo_11', 1),
('Marcos Andrade', 'marcos@exemplo.com', '$2a$10$hash_exemplo_12', 0);


-- Inserção na tabela Encomendas
INSERT INTO "Encomendas" ("usuarios_id", "material", "chumbo", "peso_laco", "cor") VALUES
(1, 'couro', 5, 700.50, 'azul'),
(2, 'nylon', 3, 650.00, 'vermelho'),
(1, 'sintético', 4, 680.75, 'preto'),
(3, 'camurça', 6, 710.00, 'marrom'),
(4, 'couro', 5, 720.50, 'preto'),
(1, 'nylon', 2, 620.00, 'rosa'),
(5, 'sintético', 4, 690.25, 'branco'),
(2, 'couro', 6, 730.00, 'vinho'),
(6, 'nylon', 3, 655.50, 'verde'),
(4, 'sintético', 5, 705.00, 'cinza'),
(7, 'couro trançado', 5, 715.20, 'bege'),
(8, 'nylon reforçado', 4, 670.00, 'laranja'),
(9, 'sintético premium', 6, 725.00, 'dourado'),
(10, 'couro', 3, 685.80, 'prata'),
(11, 'nylon', 5, 695.00, 'roxo'),
(12, 'camurça', 4, 702.10, 'amarelo'),
(3, 'sintético', 5, 699.00, 'turquesa'),
(5, 'couro', 6, 740.50, 'grafite'),
(8, 'nylon', 2, 630.00, 'magenta'),
(1, 'sintético', 4, 682.00, 'preto fosco');
