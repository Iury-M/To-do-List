import { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function Home() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/tarefas');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
      }
    };
  
    fetchTasks();
  }, []);
  

  const handleAddTask = async () => {
    if (task.trim() !== '') {
      const response = await fetch('http://localhost:4000/api/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ descricao: task }),
      });
  
      if (response.ok) {
        const novaTarefa = await response.json();
        setTasks([...tasks, novaTarefa]);
        setTask('');
      } else {
        console.error('Erro ao adicionar tarefa:', await response.text());
      }
    }
  };
  
  const handleToggleCompletion = async (id) => {
    const tarefaAtual = tasks.find((t) => t.id === id);
    const novoStatus = !tarefaAtual.completed;
  
    try {
      const res = await fetch(`http://localhost:4000/api/tarefas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: novoStatus }),
      });
  
      if (res.ok) {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: novoStatus } : t)));
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };
  
  
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/tarefas/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };
   
  const handleAttachFile = async (e, id) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    

    try {
      const res = await fetch(`http://localhost:4000/api/tarefas/${id}/anexo`, {
        method: 'PATCH',
        body: formData,
      });
  
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
      }
    } catch (error) {
      console.error('Erro ao anexar arquivo:', error);
    }
  };
  


  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 py-8">
        <div className="flex mb-4">
          <input
            type="text"
            className="border-2 border-blue-500 px-4 py-2 rounded-l-lg"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Adicione uma nova tarefa"
          />
                    
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
            onClick={handleAddTask}
          >
            Adicionar
          </button>
        </div>
        <ul className="w-full max-w-md">
        {tasks.map((task) => (
          <li
          key={task.id}
          className={`bg-white p-4 mb-2 rounded-lg shadow-md flex flex-col ${
            task.completed ? 'bg-green-200 line-through' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleCompletion(task.id)}
                className="mr-2"
              />
              {task.descricao}
            </div>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded-md"
              onClick={() => handleDeleteTask(task.id)}
            >
              Excluir
            </button>
          </div>
        
          {!task.filePath && (
            <input
              type="file"
              accept="image/*,audio/*"
              onChange={(e) => handleAttachFile(e, task.id)}
              className="mt-2"
            />
          )}
        
          {task.filePath && task.filePath.endsWith('.mp3') && (
            <audio controls src={`http://localhost:4000/${task.filePath}`} className="mt-2" />
          )}
        
          {task.filePath && task.filePath.match(/\.(jpg|jpeg|png|gif)$/) && (
            <img
              src={`http://localhost:4000/${task.filePath}`}
              alt="Anexo"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </li>
       
        ))}

        </ul>
      </div>
    </div>
  );
}
