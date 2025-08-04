const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    //Criação as tabelas usadas no banco de dados
    db.run(`
        CREATE TABLE fornecedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cnpj TEXT UNIQUE NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE vendedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        idade INTEGER CHECK (idade >= 18)
        );
    `);

    db.run(`
        CREATE TABLE produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL CHECK (preco > 0),
        estoque INTEGER NOT NULL CHECK (estoque >= 0),
        id_fornecedor INTEGER NOT NULL,
        id_vendedor INTEGER,
        FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id) ON DELETE CASCADE,
        FOREIGN KEY (id_vendedor) REFERENCES vendedores(id) ON DELETE SET NULL
        );
    `);

    db.run(`INSERT INTO fornecedores (nome, cnpj) VALUES ('Gamers fornecedores', '89.643.987/0001-10')`);
    db.run(`INSERT INTO fornecedores (nome, cnpj) VALUES ('Peças do seu PC', '11.765.412/0001-11')`);
    db.run(`INSERT INTO fornecedores (nome, cnpj) VALUES ('Loja do computador', '22.453.456/0001-12')`);
    db.run(`INSERT INTO fornecedores (nome, cnpj) VALUES ('Audio e Imagem Fornecedores', '13.222.789/0001-13')`);

    db.run(`INSERT INTO vendedores (nome, cpf, email) VALUES ('João Cardoso', '123.456.789-00', 'joao@hotmail.com')`);
    db.run(`INSERT INTO vendedores (nome, cpf, email) VALUES ('Hanna Drumond', '234.567.890-10', 'maria@gmail.com')`);
    db.run(`INSERT INTO vendedores (nome, cpf, email) VALUES ('Carla Veloso', '345.678.910-11', 'carlos@gmail.com')`);

    db.run(`INSERT INTO clientes (nome, email, idade) VALUES ('Andre Felipe', 'felipeandre@gmail.com', 30)`);
    db.run(`INSERT INTO clientes (nome, email, idade) VALUES ('Marcos Vinicius', 'marcosvini@ghotmail.com', 25)`);
    db.run(`INSERT INTO clientes (nome, email, idade) VALUES ('Fernanda Rocha', 'fernandinha@gmail.com', 40)`);
    db.run(`INSERT INTO clientes (nome, email, idade) VALUES ('Joaquim Mattos', 'jocamattos@gmail.com', 22)`);
    db.run(`INSERT INTO clientes (nome, email, idade) VALUES ('Ariana Alves', 'ariana@gmail.com', 19)`);

    //Adicionando duas entradas com erro para testar
    db.run(`INSERT INTO clientes (nome, email, idade) VALUES ('Cliente Menor de Idade', 'menor18@gmail.com', 16)`, function(err) {
    if (err) {
        console.error('Erro ao adicionar novo cliente pq é menor de idade:', err.message);
    } else {
        console.log('Produto inserido não vale, isso deve ser evitado e ele não poderia ser inserido');
    }
    });

    db.run(`INSERT INTO produtos (nome, preco, estoque, id_fornecedor, id_vendedor) VALUES ('Produto Inválido', 100.00, 10, 99, 1)`, function(err) {
    if (err) {
        console.error('Erro ao inserir produto pois o fornecedor não existe:', err.message);
    } else {
        console.log('Produto inserido não vale, isso deve ser evitado e ele não poderia ser inserido');
    }
    });

    const produtos = [
        ['Cabo USB', 49.99, 100, 1, 1],
        ['Alexa', 299.90, 50, 2, 2],
        ['Fone intra auricular', 100.00, 200, 3, 3],
        ['Notebook Ultra', 3500.00, 15, 1, 1],
        ['Mouse Gamer', 120.00, 80, 2, 2],
        ['Teclado Mecanico', 220.00, 60, 1, 3],
        ['Monitor 24 polegadas"', 990.00, 30, 4, 2],
        ['Cadeira Gamer', 1500.00, 20, 3, 1],
        ['Headet', 303.00, 90, 2, 3],
        ['Smartphone', 2500.00, 25, 4, 1],
        ['HD Externo', 450.00, 40, 1, 2],
        ['Webcam HD 4k', 2000.00, 55, 3, 3]
    ];

    for (const [nome, preco, estoque, id_fornecedor, id_vendedor] of produtos) {
        db.run(`INSERT INTO produtos (nome, preco, estoque, id_fornecedor, id_vendedor) VALUES (?, ?, ?, ?, ?)`,
        [nome, preco, estoque, id_fornecedor, id_vendedor]);
    }

    db.each(`
        SELECT p.nome AS produto, p.preco, f.nome AS fornecedor, v.nome AS vendedor
        FROM produtos p
        JOIN fornecedores f ON p.id_fornecedor = f.id
        LEFT JOIN vendedores v ON p.id_vendedor = v.id
    `, (err, row) => {
        if (err) throw err;
        console.log(`Produto: ${row.produto} | Preço: R$${row.preco.toFixed(2)} | Fornecedor: ${row.fornecedor} | Vendedor: ${row.vendedor}`);
    });
});

db.close();
