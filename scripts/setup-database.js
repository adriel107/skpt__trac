const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  try {
    console.log('🗄️ Configurando banco de dados...');
    
    // Criar tabela users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        bot_id VARCHAR(255),
        bot_token VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela users criada');
    
    // Criar tabela tracking_links
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracking_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        campaign_id VARCHAR(255) NOT NULL,
        campaign_name VARCHAR(255),
        tracking_url TEXT NOT NULL,
        bot_id VARCHAR(255) NOT NULL,
        token VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela tracking_links criada');
    
    // Criar tabela tracking_events
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id SERIAL PRIMARY KEY,
        tracking_link_id INTEGER REFERENCES tracking_links(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        campaign_id VARCHAR(255),
        sale_value DECIMAL(10,2),
        utmify_status VARCHAR(50) DEFAULT 'pending',
        utmify_response TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela tracking_events criada');
    
    // Criar tabela reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        campaign_id VARCHAR(255),
        total_sales INTEGER DEFAULT 0,
        total_value DECIMAL(10,2) DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        period_start DATE,
        period_end DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela reports criada');
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 