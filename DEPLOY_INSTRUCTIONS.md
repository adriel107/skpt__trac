# 🚀 Instruções para Deploy Manual

## Como fazer o deploy das mudanças:

### **Opção 1: GitHub Desktop (Recomendado)**
1. **Baixe GitHub Desktop**: https://desktop.github.com/
2. **Instale e faça login**
3. **Clone o repositório**: `adriel107/skpttrackk`
4. **Copie os arquivos** para a pasta clonada
5. **Commit e Push** via interface

### **Opção 2: Upload Manual no GitHub**
1. **Vá para**: https://github.com/adriel107/skpttrackk
2. **Clique em "Add file" → "Upload files"**
3. **Arraste todos os arquivos** da pasta do projeto
4. **Commit message**: "Add database test endpoints"
5. **Clique**: "Commit changes"

### **Opção 3: Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📋 **Arquivos que foram modificados:**
- `backend/src/server.js` - Adicionados endpoints de teste

## 🎯 **Depois do deploy:**
1. **Teste**: `https://skpt-track.vercel.app/health`
2. **Teste**: `https://skpt-track.vercel.app/api/test-db`
3. **Se der erro**: `https://skpt-track.vercel.app/api/setup-db`
4. **Teste o login** novamente

## 🔧 **Se ainda não funcionar:**
- Verifique os logs no Vercel Dashboard
- Confirme se a DATABASE_URL está correta
- Teste a connection string do Supabase 