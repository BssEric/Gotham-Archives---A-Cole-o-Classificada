# Gotham Archives - A Coleção Classificada

Projeto web temático de Batman, com foco em uma experiência de álbum de figurinhas estilo “arquivos confidenciais” da Batcave. A interface foi criada para transmitir uma estética de tela de vigilância, dashboard de arquivos e catálogo interativo.

---

## 🎯 Objetivo

O projeto simula um banco de dados secreto de Gotham, onde o usuário navega por uma coleção de dossiers com categorias como:

- A Família Bat
- Galeria dos Rogues
- Arquivos Arkham
- Locais de Gotham
- Bat-Gear

A navegação é feita em um livro virtual com efeito de página, e o conteúdo é carregado dinamicamente pelo backend.

---

## ✨ Estado atual do projeto

O projeto já está estruturado com:

- Frontend em HTML, CSS e JavaScript
- Interface com intro cinematográfica, cursor customizado, dashboard de progresso e modal de detalhes
- Animações com GSAP e flipbook com `page-flip`
- Backend em FastAPI responsável por expor os dados das figurinhas e servir as imagens
- CORS configurado para permitir comunicação entre o frontend e o backend
- Arquivo de deploy em `render.yaml` para publicação no Render

---

## 🧩 Funcionalidades implementadas

- Intro inicial com linha temática de Gotham e acesso ao mainframe
- Álbum interativo com páginas em formato de livro virtual
- Dashboard com progresso da coleção e estatísticas de arquivos recuperados
- Modal de dossier com informações detalhadas da figurinha
- Efeitos sonoros com Web Audio API
- Carregamento dinâmico das figurinhas pela API do backend
- Visual inspirado no universo de Batman, com tipografia, neon e atmosfera técnica

---

## 📁 Estrutura principal

- `Front-End/index.html`: estrutura principal da interface e da página do álbum
- `Front-End/app.js`: lógica do frontend, animações, navegação, modal e integração com a API
- `Front-End/style.css`: estilos visuais da aplicação
- `Back-End/main.py`: API FastAPI com dados das figurinhas e endpoints de imagens
- `Back-End/requirements.txt`: dependências do backend
- `Back-End/render.yaml`: configuração para deploy do backend

---

## ⚙️ Como executar localmente

### 1. Backend

Entre na pasta do backend e inicie a API:

```bash
cd Back-End
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

### 2. Frontend

Abra o arquivo HTML do frontend em um navegador, ou utilize uma extensão como Live Server no VS Code.

O frontend já busca os dados na API via `http://127.0.0.1:8000`, então o backend precisa estar rodando para que as figurinhas sejam carregadas corretamente.

---

## 🌐 Deploy

O backend possui configuração de deploy pronta para Render no arquivo `render.yaml`, com comando de inicialização do servidor FastAPI.

---

## 📌 Observação

Este README foi atualizado para refletir o estado atual do projeto, que já conta com a interface visual e a integração com API funcionando como base de um catálogo interativo de arquivos de Gotham.
