# 🔧 Configuração de Variáveis de Ambiente - Vercel

## 🚨 **Problema Identificado:**
O erro 500 indica que a `DATABASE_URL` não está configurada no Vercel.

## 🛠️ **Solução: Configurar Variáveis de Ambiente**

### **1. Acesse o Vercel Dashboard:**
- Vá para: https://vercel.com/dashboard
- Clique no projeto `skpt-track`
- Vá em **Settings** → **Environment Variables**

### **2. Adicione as seguintes variáveis:**

**DATABASE_URL:**
```
postgresql://postgres:[SEU_PASSWORD]@db.[SEU_PROJECT_ID].supabase.co:5432/postgres
```

**JWT_SECRET:**
```
skpt-track-secret-key-2024
```

**CORS_ORIGIN:**
```
https://skpt-track.vercel.app
```

**NODE_ENV:**
```
production
```

### **3. Como obter a DATABASE_URL do Supabase:**

**Se você já tem Supabase:**
1. Vá para: https://supabase.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** → **Database**
4. Copie a **Connection string**

**Se você NÃO tem Supabase:**
1. Vá para: https://supabase.com
2. **Crie uma conta gratuita**
3. **Crie um novo projeto**
4. Vá em **Settings** → **Database**
5. Copie a **Connection string**

### **4. Exemplo de DATABASE_URL:**
```
postgresql://postgres.abcdefghijklmnop:skpt-track-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### **5. Após configurar:**
1. **Redeploy** o projeto no Vercel
2. **Teste**: `https://skpt-track.vercel.app/health`
3. **Teste**: `https://skpt-track.vercel.app/api/test-db`

## 🎯 **Teste Rápido:**

**Se der erro 500:**
- Verifique se a DATABASE_URL está correta
- Confirme se o Supabase está ativo
- Verifique os logs no Vercel Dashboard

**Se funcionar:**
- O backend estará conectado ao banco
- Você poderá fazer login na aplicação

## 📋 **Próximos Passos:**

1. **Configure as variáveis** acima
2. **Redeploy** o projeto
3. **Teste os endpoints**
4. **Me informe os resultados** 