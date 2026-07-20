# 🦇 Gotham Archives

> Uma experiência digital imersiva inspirada em arquivos classificados, coleções e sistemas de inteligência do universo do Batman.

**Gotham Archives** transforma uma coleção de personagens e elementos do universo Batman em uma experiência interativa com estética de arquivo secreto, animações e um álbum digital com efeito de virar páginas.

## 🌐 Live Demo

> Adicione aqui o link do seu frontend publicado na Vercel.

```text
https://seu-projeto.vercel.app
```

## ✨ Funcionalidades

* 📖 Álbum digital interativo com efeito de virar páginas
* 🦇 Coleção de personagens e elementos do universo Batman
* 🖼️ Carregamento dinâmico de imagens através de uma API
* 🗂️ Organização por categorias e raridades
* 🔍 Visualização detalhada dos arquivos
* 🖱️ Cursor personalizado com interação baseada no movimento
* ✨ Animações e transições imersivas
* 🔊 Sistema de efeitos sonoros interativos
* 📱 Interface responsiva
* ⌨️ Suporte a interações por teclado
* 🌐 Integração com backend desenvolvido em FastAPI

## 🛠️ Tecnologias

* **HTML5**
* **CSS3**
* **JavaScript**
* **GSAP**
* **PageFlip**
* **Web Audio API**
* **FastAPI API**
* **Vercel**

## 🎨 Conceito visual

A interface foi desenvolvida com uma direção visual inspirada em:

* arquivos classificados;
* sistemas de inteligência;
* tecnologia da Batcave;
* interfaces de investigação;
* documentos secretos;
* coleções digitais.

A experiência busca combinar uma estética cinematográfica com uma interface funcional e intuitiva.

## 🧩 Arquitetura

```text
Frontend
│
├── HTML
├── CSS
├── JavaScript
│
└── API Request
        │
        ▼
Gotham Archives API
        │
        ▼
     FastAPI
        │
        ├── Dados das figurinhas
        └── Imagens
```

## 🔌 Integração com a API

O frontend se conecta à API através da variável:

```javascript
const API_BASE_URL =
  "https://gotham-archives-api.onrender.com";
```

A aplicação utiliza essa URL para buscar os dados da coleção:

```text
GET /figurinhas
```

E os recursos visuais:

```text
GET /figurinhas/{id}/imagem
```

## 📁 Estrutura do projeto

```text
Frontend/
├── index.html
├── style.css
├── app.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── ...
└── README.md
```

## 🚀 Executando localmente

### 1. Clone o repositório

```bash
git clone https://github.com/BssEric/SEU-REPOSITORIO-FRONTEND.git
```

```bash
cd SEU-REPOSITORIO-FRONTEND
```

### 2. Execute o projeto

Como o projeto utiliza HTML, CSS e JavaScript, você pode executá-lo utilizando:

* Live Server no Visual Studio Code;
* qualquer servidor HTTP local;
* uma plataforma de hospedagem estática.

## 🌍 Deploy

O frontend pode ser hospedado utilizando plataformas como:

* Vercel;
* GitHub Pages;
* Netlify.

A aplicação foi projetada para funcionar com um backend independente hospedado na nuvem.

## 🔗 Backend

A API responsável pelo fornecimento dos dados está disponível em:

```text
https://gotham-archives-api.onrender.com
```

Documentação:

```text
https://gotham-archives-api.onrender.com/docs
```

## 📸 Preview

> Adicione aqui screenshots ou GIFs da experiência.

Exemplo:

```markdown
![Gotham Archives Preview](./assets/preview.png)
```

## 🎯 Objetivo do projeto

O objetivo do Gotham Archives é explorar a criação de uma experiência web mais imersiva, combinando:

* desenvolvimento frontend;
* animação;
* interação;
* design de interface;
* consumo de APIs;
* arquitetura frontend/backend.

O projeto também representa um estudo sobre como transformar uma interface tradicional em uma experiência digital mais narrativa e memorável.

## 👨‍💻 Autor

**Éric Botelho**

Desenvolvedor focado em desenvolvimento web, frontend, UI/UX e experiências digitais.

---

🦇 **Gotham Archives — The Classified Collection**
