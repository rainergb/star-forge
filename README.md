# Star Forge ⚡

Aplicação desktop moderna com **Electron + React + TypeScript + Vite**

## 🚀 Stack Tecnológica

- ⚡ **Vite** - Build tool ultrarrápido
- ⚛️ **React 18** - UI library
- 📘 **TypeScript** - Type safety
- 🖥️ **Electron** - Desktop framework
- 🎨 **CSS3** - Estilos modernos com dark mode

## 📦 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🛠️ Instalação

```bash
npm install
```

## 💻 Desenvolvimento

```bash
# Rodar aplicação Electron em modo dev
npm run electron:dev

# Apenas desenvolvimento web (sem Electron)
npm run dev
```

A aplicação abrirá automaticamente em modo Electron com hot reload.

## 🏗️ Build

```bash
# Build completo da aplicação
npm run electron:build
```

## 📁 Estrutura do Projeto

```
star-forge/
├── electron/
│   ├── main.ts          # Processo principal do Electron
│   └── preload.ts       # Preload script (context bridge)
├── src/
│   ├── App.tsx          # Componente principal
│   ├── App.css          # Estilos do App
│   ├── main.tsx         # Entry point React
│   ├── index.css        # Estilos globais
│   └── vite-env.d.ts    # Type definitions
├── index.html           # HTML template
├── vite.config.ts       # Configuração Vite
├── tsconfig.json        # Configuração TypeScript
└── package.json         # Dependências
```

## 🎯 Próximos Passos

### Recomendações para Dev React/Next.js:

1. **Roteamento**
   ```bash
   npm install react-router-dom
   ```

2. **Estado Global**
   ```bash
   npm install zustand
   # ou
   npm install @reduxjs/toolkit react-redux
   ```

3. **Estilização**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Formulários**
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```

5. **UI Components**
   ```bash
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
   # ou
   npm install @mui/material @emotion/react @emotion/styled
   ```

## 🔒 Segurança

O projeto segue as melhores práticas:
- ✅ Context Isolation habilitado
- ✅ Node Integration desabilitado
- ✅ Preload script para comunicação segura
- ✅ TypeScript para type safety

## 🎨 Features

- ⚡ Hot Module Replacement (HMR)
- 🌓 Dark mode automático
- 📱 Design responsivo
- 🔄 TypeScript em todo codebase
- 🛡️ ESLint configurado

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor Vite |
| `npm run electron:dev` | Inicia Electron + Vite |
| `npm run build` | Build completo (TS + Vite + Electron) |
| `npm run preview` | Preview do build |

## 📄 Licença

ISC

---

Desenvolvido com 💜 usando as melhores práticas React/Next.js
