# Top Prime — Sistema de Propostas v2

## Estrutura

```
topprime/
├── index.html           → Formulário principal
├── css/
│   ├── style.css        → Interface do sistema
│   └── proposta.css     → Estilos do PDF gerado
├── js/
│   └── app.js           → Toda a lógica (comentada)
├── img/
│   ├── logo-topprime.png  → Logo Top Prime (já incluído)
│   ├── logo-select.png    → Logo Select Saúde (já incluído)
│   ├── logo-samel.png     → Logo Samel (já incluído)
│   └── logo-bradesco.png  → Adicione manualmente se quiser
└── README.md
```

## Como rodar na rede local

```bash
# 1. Instale o Node.js em nodejs.org
# 2. Instale o servidor estático (uma vez só)
npm install -g serve

# 3. Entre na pasta do projeto
cd caminho/para/topprime

# 4. Inicie o servidor
serve -l 3000

# 5. Descubra seu IP
ipconfig   # Windows

# 6. Compartilhe com a equipe
# http://SEU_IP:3000
```

## Adicionar novas operadoras

### 1. Adicione o logo em `img/`
Coloque o arquivo PNG ou JPG na pasta `img/`.
Recomendado: fundo branco ou transparente, tamanho mínimo 300×150px.

### 2. Adicione no select (index.html)
```html
<option value="Nome da Operadora" data-logo="img/logo-arquivo.png">Nome da Operadora</option>
```

### 3. Registre no mapa de logos (js/app.js)
```javascript
var LOGOS_OPERADORAS = {
  'Nome da Operadora': 'img/logo-arquivo.png',
  // ... demais operadoras
};
```

## Campos fixos no PDF
Os nomes **Giovani Júnior** (Diretor Executivo) e **Cristian Araújo** (Supervisor Técnico)
aparecem automaticamente no PDF sem precisar preencher.
Para alterar, edite a função `gerarHTMLProposta` em `js/app.js`.
