# 🔧 Fix 404 Error - Vercel Deployment

## 🚨 **Problema Identificado:**
O erro 404 indica que o Vercel não está conseguindo fazer o build do backend corretamente.

## 🛠️ **Soluções:**

### **Solução 1: Deploy Separado (Recomendado)**

**1. Deploy do Backend:**
- Vá para: https://vercel.com/new
- **Importe o repositório**: `adriel107/skpttrackk`
- **Root Directory**: `backend`
- **Framework Preset**: Node.js
- **Build Command**: `npm install`
- **Output Directory**: (deixe vazio)
- **Install Command**: `npm install`

**2. Configure as variáveis de ambiente:**
```
DATABASE_URL=sua_url_do_supabase
JWT_SECRET=seu_jwt_secret
CORS_ORIGIN=https://skpt-track.vercel.app
```

**3. Deploy do Frontend:**
- Crie outro projeto no Vercel
- **Root Directory**: `frontend`
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### **Solução 2: Corrigir Monorepo**

**1. Atualize o vercel.json raiz:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.js"
    },
    {
      "src": "/health",
      "dest": "/backend/src/server.js"
    },
    {
      "src": "/track",
      "dest": "/backend/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

**2. Adicione um arquivo `api/index.js` na raiz:**
```javascript
module.exports = require('../backend/src/server.js');
```

### **Solução 3: Verificar Logs**

**1. Acesse o Vercel Dashboard:**
- Vá para: https://vercel.com/dashboard
- Clique no projeto `skpt-track`
- Vá em "Functions" → "View Function Logs"

**2. Verifique os erros de build**

## 🎯 **Teste após correção:**

1. **Health Check**: `https://skpt-track.vercel.app/health`
2. **API Test**: `https://skpt-track.vercel.app/api/test-db`
3. **Setup DB**: `https://skpt-track.vercel.app/api/setup-db`

## 📋 **Próximos Passos:**

1. **Escolha uma solução** acima
2. **Faça o deploy** seguindo as instruções
3. **Teste os endpoints** listados
4. **Me informe os resultados** para continuar

## 🔍 **Diagnóstico Rápido:**

**Se ainda der 404:**
- Verifique se o repositório está sincronizado
- Confirme se todos os arquivos estão no GitHub
- Verifique os logs do Vercel
- Considere fazer deploy separado do backend 