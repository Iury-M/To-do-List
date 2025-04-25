const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTasks = async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
};

exports.addTask = async (req, res) => {
  const { text } = req.body;
  const newTask = await prisma.task.create({
    data: { text, completed: false },
  });
  res.json(newTask);
};

exports.toggleTask = async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({ where: { id: Number(id) } });
  const updated = await prisma.task.update({
    where: { id: Number(id) },
    data: { completed: !task.completed },
  });
  res.json(updated);
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  await prisma.task.delete({ where: { id: Number(id) } });
  res.json({ message: 'Tarefa excluída!' });
};
