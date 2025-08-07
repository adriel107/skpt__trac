const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const trackingRoutes = require('./routes/tracking');
const reportsRoutes = require('./routes/reports');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/reports', reportsRoutes);

// Endpoint de rastreamento público
app.get('/track', require('./routes/track'));

// Health check - SEM dependência do banco
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database test endpoint - COM tratamento de erro melhorado
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Verificar se DATABASE_URL existe
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        success: false, 
        message: 'DATABASE_URL não configurada',
        error: 'Variável de ambiente DATABASE_URL não encontrada'
      });
    }

    const { query } = require('./config/database');
    console.log('📊 Executando query de teste...');
    
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Query executada com sucesso');
    
    res.json({ 
      success: true, 
      message: 'Database connected!',
      time: result.rows[0].current_time,
      database_url: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada'
    });
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Setup database tables - COM tratamento de erro melhorado
app.get('/api/setup-db', async (req, res) => {
  try {
    console.log('🔧 Iniciando setup do banco de dados...');
    
    // Verificar se DATABASE_URL existe
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        success: false, 
        message: 'DATABASE_URL não configurada',
        error: 'Variável de ambiente DATABASE_URL não encontrada'
      });
    }

    const { query } = require('./config/database');
    
    console.log('📋 Criando tabela users...');
    // Criar tabela users
    await query(`
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
    
    console.log('📋 Criando tabela tracking_links...');
    // Criar tabela tracking_links
    await query(`
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
    
    console.log('📋 Criando tabela tracking_events...');
    // Criar tabela tracking_events
    await query(`
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
    
    console.log('📋 Criando tabela reports...');
    // Criar tabela reports
    await query(`
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
    
    console.log('✅ Todas as tabelas criadas com sucesso!');
    res.json({ 
      success: true, 
      message: 'Database tables created successfully!'
    });
  } catch (error) {
    console.error('❌ Erro no setup do banco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create tables',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    console.log('📊 Ambiente:', process.env.NODE_ENV);
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');
    
    // Tentar conectar ao banco de dados (opcional para o servidor iniciar)
    try {
      await connectDatabase();
      console.log('✅ Conectado ao banco de dados');
    } catch (dbError) {
      console.warn('⚠️ Aviso: Não foi possível conectar ao banco de dados:', dbError.message);
      console.log('ℹ️ O servidor continuará rodando, mas algumas funcionalidades podem não funcionar');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 