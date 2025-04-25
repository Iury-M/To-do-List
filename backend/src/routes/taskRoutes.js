const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db'); // Importando a conexão com o banco de dados

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Rota para pegar todas as tarefas
router.get('/tarefas', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tarefas');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// Rota para criar uma nova tarefa (com ou sem arquivo)
router.post('/tarefas', upload.single('file'), async (req, res) => {
  const { descricao } = req.body;
  const filePath = req.file ? req.file.path : null;

  if (descricao) {
    try {
      const result = await db.query(
        'INSERT INTO tarefas (descricao, file_path) VALUES ($1, $2) RETURNING *',
        [descricao, filePath]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
  } else {
    res.status(400).json({ error: 'Descrição da tarefa é obrigatória' });
  }
});

// Rota para marcar a tarefa como concluída ou não
router.patch('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const task = await db.query('SELECT * FROM tarefas WHERE id = $1', [id]);

  if (task.rows.length > 0) {
    const updatedTask = task.rows[0];
    const novoStatus = !updatedTask.completed;
    try {
      await db.query('UPDATE tarefas SET completed = $1 WHERE id = $2', [
        novoStatus,
        id,
      ]);
      res.json({ ...updatedTask, completed: novoStatus });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
  } else {
    res.status(404).json({ error: 'Tarefa não encontrada' });
  }
});

// Rota para excluir uma tarefa
router.delete('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM tarefas WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Tarefa não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

// Rota para adicionar anexo a uma tarefa existente
router.patch('/tarefas/:id/anexo', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const filePath = req.file ? req.file.path : null;

  try {
    const result = await db.query(
      'UPDATE tarefas SET file_path = $1 WHERE id = $2 RETURNING *',
      [filePath, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Tarefa não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao anexar arquivo' });
  }
});

module.exports = router;
