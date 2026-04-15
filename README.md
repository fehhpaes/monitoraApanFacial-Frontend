# MonitoraApan Facial - Frontend

Frontend em React + TypeScript + Vite para o sistema de cadastro e monitoramento de alunos com captura de fotos via webcam.

## 🚀 Características

- ✅ Cadastro de alunos com dados completos
- ✅ Captura de foto via webcam em tempo real
- ✅ Edição e exclusão de alunos
- ✅ Busca e filtro de alunos
- ✅ Interface responsiva (mobile, tablet, desktop)
- ✅ Upload de fotos para Cloudinary
- ✅ Notificações visuais (toasts)
- ✅ Ícones modernos (Lucide React)

## 📋 Requisitos

- Node.js 18+
- npm ou yarn
- Backend rodando em http://localhost:5000 (desenvolvimento)

## 🛠️ Instalação

```bash
npm install
```

## 📝 Configuração (.env)

```env
# URL da API do Backend
VITE_API_URL=http://localhost:5000/api

# Para produção (Render):
VITE_API_URL=https://monitoraapanfacial-backend.onrender.com
```

## 🚀 Iniciar

### Desenvolvimento

```bash
npm run dev
```

Abrirá automaticamente em http://localhost:3000

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📚 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── FormCadastro.tsx    # Formulário de cadastro
│   ├── CameraCapture.tsx   # Modal com câmera
│   ├── GaleriaAlunos.tsx   # Grid de alunos
│   ├── CardAluno.tsx       # Card individual
│   └── ModalEditar.tsx     # Modal de edição
├── pages/              # Páginas
│   └── Home.tsx           # Página principal
├── services/           # Serviços
│   └── api.ts            # Cliente Axios + endpoints
├── types/              # Tipos TypeScript
│   └── index.ts          # Interfaces globais
├── App.tsx            # Componente raiz
├── main.tsx          # Entry point React
└── index.css         # Estilos Tailwind + CSS global
```

## 🔌 API Endpoints Utilizados

- `GET /api/alunos` - Listar alunos
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno
- `POST /api/alunos/upload/foto` - Upload de foto
- `GET /api/cursos` - Listar cursos

## 🎨 Tecnologias

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Toastify** - Notificações
- **React Webcam** - Captura de câmera
- **Lucide React** - Ícones

## 🖼️ Componentes Principais

### FormCadastro
Formulário para cadastrar novo aluno com validação.

### CameraCapture
Modal com webcam para capturar foto do aluno.

### GaleriaAlunos
Grid responsivo com lista de alunos cadastrados, busca e filtro.

### CardAluno
Card individual mostrando informações do aluno com opções de editar e deletar.

### ModalEditar
Modal para editar dados do aluno existente.

## 🔐 Segurança

- Validação de entrada no frontend
- Proteção CORS (configurado no backend)
- Sem armazenamento de dados sensíveis localmente

## 🚀 Deploy no Render

1. Conecte o repositório GitHub ao Render
2. Crie novo Web Service com Docker
3. Configure `VITE_API_URL` como variável de ambiente
4. Deploy automático a cada push

## 📊 Performance

- Build otimizado com Vite
- Lazy loading de componentes
- Cache de imagens
- Compressão de assets

## 🐛 Troubleshooting

### Erro "Cannot find module '@'"
Verifique se o `vite.config.ts` está correto.

### Erro na API
Verifique se a URL em `VITE_API_URL` está correta e o backend está rodando.

### Foto não carrega
Verifique credenciais do Cloudinary no backend.

## 📞 Suporte

Para problemas, verifique:
1. Logs do navegador (F12 → Console)
2. Status da API em `/health`
3. Variáveis de ambiente

## 📄 Licença

MIT

## 👨‍💻 Autor

Felipe Paes
