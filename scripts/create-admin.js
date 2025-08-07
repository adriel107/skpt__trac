const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/skpt_track'
});

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário administrador...');
    
    // Dados do admin
    const adminData = {
      name: 'Administrador',
      email: 'admin@skpttrack.com',
      password: 'admin123',
      bot_id: 'BOT001',
      bot_token: 'TOKEN123'
    };
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(adminData.password, 10);
    
    // Verificar se usuário já existe
    const checkUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminData.email]
    );
    
    if (checkUser.rows.length > 0) {
      console.log('⚠️ Usuário admin já existe!');
      return;
    }
    
    // Inserir usuário
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, bot_id, bot_token, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, name, email`,
      [adminData.name, adminData.email, passwordHash, adminData.bot_id, adminData.bot_token]
    );
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📋 Dados de acesso:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Senha: ${adminData.password}`);
    console.log(`   ID do Bot: ${adminData.bot_id}`);
    console.log(`   Token do Bot: ${adminData.bot_token}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser(); 