/**
 * ═══════════════════════════════════════════════════════════
 * TOP PRIME — Servidor Local
 * servidor.js
 *
 * COMO RODAR:
 *   node servidor.js
 *
 * COMO ACESSAR:
 *   Neste computador:  http://localhost:3000
 *   Na rede local:     http://SEU_IP:3000
 *   (rode ipconfig no cmd para descobrir seu IP)
 *
 * O QUE FAZ:
 *   - Serve todos os arquivos do projeto (HTML, CSS, JS, imagens)
 *   - Salva cada proposta gerada em propostas.json
 *   - Disponibiliza o histórico para todos na rede
 *   - Não precisa de banco de dados nem Apache
 * ═══════════════════════════════════════════════════════════
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

/* ─── Configurações ─── */
const PORTA          = 3000;
const ARQUIVO_DADOS  = path.join(__dirname, 'propostas.json');
const ARQUIVO_PLACAR = path.join(__dirname, 'placar.json');

/* ─── Mapa de tipos de arquivo para Content-Type ─── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

/* ─── Garante que os arquivos de dados existem ─── */
if (!fs.existsSync(ARQUIVO_DADOS)) {
  fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify({ propostas: [] }, null, 2));
  console.log('  Arquivo propostas.json criado.');
}
if (!fs.existsSync(ARQUIVO_PLACAR)) {
  fs.writeFileSync(ARQUIVO_PLACAR, JSON.stringify({ data: null }, null, 2));
  console.log('  Arquivo placar.json criado.');
}

/* ═══════════════════════════════════════════════════════════
   FUNÇÕES DE DADOS
═══════════════════════════════════════════════════════════ */

/** Lê todas as propostas do arquivo JSON */
function lerPropostas() {
  try {
    var conteudo = fs.readFileSync(ARQUIVO_DADOS, 'utf8');
    return JSON.parse(conteudo).propostas || [];
  } catch (e) {
    console.error('Erro ao ler propostas.json:', e.message);
    return [];
  }
}

/** Salva uma nova proposta no arquivo JSON */
function salvarProposta(proposta) {
  try {
    var propostas = lerPropostas();

    /* Adiciona ID único e timestamp */
    proposta.id        = Date.now();
    proposta.savedAt   = new Date().toISOString();

    /* Mais recente primeiro */
    propostas.unshift(proposta);

    fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify({ propostas: propostas }, null, 2));
    return true;
  } catch (e) {
    console.error('Erro ao salvar proposta:', e.message);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════
   ROTEAMENTO DAS REQUISIÇÕES
═══════════════════════════════════════════════════════════ */

/**
 * Trata cada requisição recebida.
 * Rotas da API:
 *   GET  /api/propostas       → lista todas as propostas
 *   POST /api/propostas       → salva uma nova proposta
 * Qualquer outra rota:
 *   Serve o arquivo estático correspondente
 */
function tratarRequisicao(req, res) {

  /* Cabeçalhos CORS — permite acesso de qualquer origem na rede */
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  /* Preflight CORS */
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  /* ── API: GET /api/propostas ── */
  if (req.method === 'GET' && req.url === '/api/propostas') {
    var propostas = lerPropostas();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, propostas: propostas }));
    return;
  }

  /* ── API: POST /api/propostas ── */
  if (req.method === 'POST' && req.url === '/api/propostas') {
    var corpo = '';

    req.on('data', function (chunk) { corpo += chunk.toString(); });

    req.on('end', function () {
      try {
        var proposta = JSON.parse(corpo);
        var ok       = salvarProposta(proposta);

        if (ok) {
          console.log('  [+] Proposta salva:', proposta.nomeEmpresa, '—', proposta.operadora);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, erro: 'Erro ao salvar.' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, erro: 'JSON inválido.' }));
      }
    });

    return;
  }

  /* ── API: GET /api/placar ── */
  if (req.method === 'GET' && req.url === '/api/placar') {
    try {
      var conteudo = fs.readFileSync(ARQUIVO_PLACAR, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(conteudo);
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: null }));
    }
    return;
  }

  /* ── API: POST /api/placar ── */
  if (req.method === 'POST' && req.url === '/api/placar') {
    var corpo = '';
    req.on('data', function (chunk) { corpo += chunk.toString(); });
    req.on('end', function () {
      try {
        var data = JSON.parse(corpo);
        fs.writeFileSync(ARQUIVO_PLACAR, JSON.stringify({ data: data }, null, 2));
        console.log('  [placar] Dados atualizados —', new Date().toLocaleTimeString('pt-BR'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false }));
      }
    });
    return;
  }

  /* ── API: DELETE /api/placar ── */
  if (req.method === 'DELETE' && req.url === '/api/placar') {
    fs.writeFileSync(ARQUIVO_PLACAR, JSON.stringify({ data: null }, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  /* ── Arquivos estáticos ── */
  var urlPath = req.url.split('?')[0];          /* ignora query string */
  if (urlPath === '/') urlPath = '/index.html'; /* rota raiz → index */

  var filePath = path.join(__dirname, urlPath);
  var ext      = path.extname(filePath).toLowerCase();
  var mime     = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, function (err, data) {
    if (err) {
      /* Arquivo não encontrado */
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 — Arquivo não encontrado: ' + urlPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

/* ═══════════════════════════════════════════════════════════
   INICIAR SERVIDOR
═══════════════════════════════════════════════════════════ */

var servidor = http.createServer(tratarRequisicao);

servidor.listen(PORTA, '0.0.0.0', function () {

  /* Descobre o IP local da máquina */
  var ip = 'SEU_IP';
  var interfaces = os.networkInterfaces();
  for (var nome in interfaces) {
    for (var iface of interfaces[nome]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log('  TOP PRIME — Servidor rodando!');
  console.log('══════════════════════════════════════════');
  console.log('  Neste computador : http://localhost:' + PORTA);
  console.log('  Na rede local    : http://' + ip + ':' + PORTA);
  console.log('──────────────────────────────────────────');
  console.log('  Propostas salvas em: propostas.json');
  console.log('  Para parar: Ctrl + C');
  console.log('══════════════════════════════════════════\n');
});
