# Verificador de Subespaços Vetoriais 🔍

Um verificador visual e interativo que determina se um conjunto é ou não um subespaço de ℝⁿ.

## 📋 Funcionalidades

- ✅ **Input de vetores e suas restrições**: Interface intuitiva para entrada de vetores em qualquer dimensão
- 🔍 **Verificação automática das propriedades de subespaço**: Valida as três propriedades fundamentais:
  - Contém o vetor zero
  - Fechado sob adição
  - Fechado sob multiplicação escalar
- 📝 **Explicação passo-a-passo**: Mostra detalhadamente cada verificação realizada
- 📐 **Visualização geométrica 2D**: Representação gráfica para espaços bidimensionais
- 🎲 **Gerador de exemplos aleatórios**: Exemplos pré-configurados para aprendizado

## 🛠️ Tecnologias

- **Backend**: Python 3.8+ com Flask para lógica matemática
- **Frontend**: JavaScript vanilla para interface interativa
- **Visualização**: Canvas API para gráficos 2D
- **Computação Numérica**: NumPy para operações vetoriais

## 🚀 Instalação e Uso

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/zzruanxx/Subspace-Validator.git
cd Subspace-Validator
```

2. Instale as dependências Python:
```bash
pip install -r requirements.txt
```

### Executando a aplicação

1. Inicie o servidor Flask:
```bash
cd backend
python app.py
```

2. Abra seu navegador e acesse:
```
http://localhost:5000
```

## 📖 Como Usar

### 1. Entrada de Dados

- **Escolha a dimensão**: Selecione 2D (ℝ²), 3D (ℝ³) ou 4D (ℝ⁴)
- **Defina restrições** (opcional): 
  - Exemplos: `x + y = 0`, `y = 2*x`, `x + y + z = 0`
  - Use variáveis: x, y, z, w
- **Adicione vetores**: Clique em "➕ Adicionar Vetor" e preencha as coordenadas

### 2. Verificação

Clique em "✓ Verificar Subespaço" para:
- Verificar se o conjunto é um subespaço
- Ver explicação passo-a-passo
- Visualizar geometricamente (para 2D)

### 3. Exemplos

Clique em "🎲 Exemplo Aleatório" para carregar exemplos pré-configurados de:
- Subespaços válidos (planos pela origem, retas pela origem)
- Não-subespaços (planos/retas que não passam pela origem)

## 📐 Exemplos de Uso

### Exemplo 1: Reta pela origem (É subespaço)
- **Dimensão**: 2D
- **Restrição**: `y = 2*x`
- **Vetores**: (0, 0), (1, 2), (2, 4), (-1, -2)
- **Resultado**: ✓ É um subespaço

### Exemplo 2: Reta deslocada (Não é subespaço)
- **Dimensão**: 2D
- **Restrição**: `y = x + 1`
- **Vetores**: (0, 1), (1, 2), (2, 3)
- **Resultado**: ✗ Não é um subespaço (não contém o vetor zero)

### Exemplo 3: Plano pela origem (É subespaço)
- **Dimensão**: 3D
- **Restrição**: `x + y + z = 0`
- **Vetores**: (1, -1, 0), (1, 0, -1), (0, 1, -1), (0, 0, 0)
- **Resultado**: ✓ É um subespaço

## 🧮 Propriedades Verificadas

O verificador testa as três propriedades fundamentais de um subespaço vetorial:

1. **Vetor Zero**: O conjunto deve conter o vetor zero (0)
2. **Fechamento sob Adição**: Se u e v estão no conjunto, então u + v também está
3. **Fechamento sob Multiplicação Escalar**: Se v está no conjunto e c é um escalar, então c·v também está

## 🏗️ Estrutura do Projeto

```
Subspace-Validator/
├── backend/
│   ├── app.py                 # API Flask
│   └── subspace_verifier.py   # Lógica matemática
├── static/
│   ├── app.js                 # JavaScript principal
│   ├── visualization.js       # Visualização 2D
│   └── styles.css             # Estilos CSS
├── index.html                 # Interface principal
├── requirements.txt           # Dependências Python
├── .gitignore                 # Arquivos ignorados
└── README.md                  # Este arquivo
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional.

## 👨‍💻 Autor

Desenvolvido como uma ferramenta educacional para auxiliar no aprendizado de álgebra linear.
