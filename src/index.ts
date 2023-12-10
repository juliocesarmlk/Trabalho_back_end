import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const chaveSecreta = 'sedrhtyhb';

const app = express();
const porta = 3003;
const tarefas: { id: number; titulo: string; descricao: string; concluida: boolean }[] = [];
const usuarios: { id: number; nome: string; email: string; senha: string; role: string }[] = [];


app.use(express.json());
app.use(cors());

// Middleware para verificar token
function verificarToken(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ mensagem: 'Token não fornecido' });
    }
  
    jwt.verify(token, chaveSecreta, (err, decoded) => {
      if (err) {
        return res.status(401).json({ mensagem: 'Token inválido' });
      }
  
      req.userId = decoded.userId;
      req.userRole = decoded.userRole;
      next();
    });
  }
  

// Endpoint POST para criar uma nova tarefa
app.post('/tarefas', (req, res) => {
  const { titulo, descricao, concluida } = req.body;

  if (!titulo) {
    return res.status(400).json({ mensagem: 'É obrigatório dar um título à sua tarefa' });
  }

  const novaTarefa = {
    id: tarefas.length + 1,
    titulo,
    descricao: descricao || '',
    concluida: concluida || false,
  };

  tarefas.push(novaTarefa);

  res.status(201).json(novaTarefa);
});

// Endpoint POST para registrar um novo usuário
app.post('/signup', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
  }

  const usuarioExistente = usuarios.find(u => u.email === email);

  if (usuarioExistente) {
    return res.status(400).json({ mensagem: 'Este email já está sendo utilizado' });
  }

  const novoUsuario = {
    id: usuarios.length + 1,
    nome,
    email,
    senha: bcrypt.hashSync(senha, 10),
    role: 'user',
  };

  usuarios.push(novoUsuario);

  res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
});

// Endpoint POST para realizar login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email);

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ userId: usuario.id }, chaveSecreta, { expiresIn: '1h' });

  res.status(200).json({ token });
});

// Rotas protegidas por token
app.use(verificarToken);

// Endpoint GET para buscar todas as tarefas
app.get('/tarefas', (req, res) => {
  res.status(200).json(tarefas);
});

// Endpoint GET por ID para buscar uma tarefa específica
app.get('/tarefas/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const tarefaEncontrada = tarefas.find(tarefa => tarefa.id === taskId);

  if (tarefaEncontrada) {
    res.status(200).json(tarefaEncontrada);
  } else {
    res.status(404).json({ mensagem: 'Tarefa não encontrada' });
  }
});

// Endpoint PUT para atualizar uma tarefa por ID
app.put('/tarefas/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const tarefaAtualizada = req.body;

  const tarefaIndex = tarefas.findIndex(tarefa => tarefa.id === taskId);

  if (tarefaIndex !== -1) {
    tarefas[tarefaIndex] = { ...tarefas[tarefaIndex], ...tarefaAtualizada };
    res.status(200).json(tarefas[tarefaIndex]);
  } else {
    res.status(404).json({ mensagem: 'Tarefa não encontrada' });
  }
});

// Endpoint DELETE para excluir uma tarefa por ID
app.delete('/tarefas/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
  
    // Verificar se o usuário é um administrador antes de permitir a exclusão
    if (req.userRole !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado. Somente administradores podem excluir tarefas.' });
    }
  
    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.id === taskId);
  
    if (tarefaIndex !== -1) {
      tarefas.splice(tarefaIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
  });
  

app.listen(porta, () => {
  console.log('Servidor rodando na porta:', porta);
});
