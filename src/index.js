"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const porta = 3003;
const tarefas = [];
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
    }
    else {
        res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
});
// Endpoint PUT para atualizar uma tarefa por ID
app.put('/tarefas/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const tarefaAtualizada = req.body;
    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.id === taskId);
    if (tarefaIndex !== -1) {
        tarefas[tarefaIndex] = Object.assign(Object.assign({}, tarefas[tarefaIndex]), tarefaAtualizada);
        res.status(200).json(tarefas[tarefaIndex]);
    }
    else {
        res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
});
app.listen(porta, () => {
    console.log("Servidor rodando na porta:", porta);
});
