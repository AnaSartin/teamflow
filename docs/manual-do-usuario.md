# TeamFlow — Manual do Usuário

> Sistema de Gestão de Colaboradores  
> Versão 1.0 · Uso interno

---

## Sumário

1. [O que é o TeamFlow](#1-o-que-é-o-teamflow)
2. [Para quem é este sistema](#2-para-quem-é-este-sistema)
3. [Como acessar](#3-como-acessar)
4. [Dashboard — Painel de Controle](#4-dashboard--painel-de-controle)
5. [Colaboradores](#5-colaboradores)
6. [Grelha Salarial](#6-grelha-salarial)
7. [Agenda de Férias](#7-agenda-de-férias)
8. [Configurações](#8-configurações)
9. [Passo a passo operacional](#9-passo-a-passo-operacional)
10. [Importação em massa via CSV](#10-importação-em-massa-via-csv)
11. [Boas práticas para gestores](#11-boas-práticas-para-gestores)

---

## 1. O que é o TeamFlow

O **TeamFlow** é um sistema de gestão de colaboradores desenvolvido para dar ao gestor uma visão clara, centralizada e atualizada de toda a equipe.

Com ele você consegue:

- Cadastrar e gerenciar os dados de cada colaborador
- Acompanhar a estrutura salarial da equipe (grelha de cargos e salários)
- Controlar o vencimento de férias e evitar que colaboradores percam o período
- Registrar promoções e reajustes salariais com histórico completo
- Receber alertas automáticos sobre situações que precisam de atenção
- Exportar os dados da equipe para planilha Excel
- Importar colaboradores em lote via arquivo CSV

O sistema foi projetado para ser **prático e visual** — a maioria das informações importantes aparece logo na tela inicial, sem que você precise navegar por vários menus.

---

## 2. Para quem é este sistema

| Perfil | Como usa |
|--------|---------|
| **Gestor de equipe** | Acompanha status, férias, promoções e salários da sua equipe |
| **RH / People** | Mantém os dados atualizados, controla a grelha salarial e gera relatórios |
| **Liderança executiva** | Usa o Dashboard para ter visão macro do time e identificar riscos |

> O acesso é feito com e-mail e senha cadastrados pelo administrador do sistema.  
> Cada usuário vê os dados de toda a equipe cadastrada.

---

## 3. Como acessar

1. Abra o navegador e acesse o endereço fornecido pela sua empresa (ex.: `https://teamflow.suaempresa.com.br`)
2. Na tela de login, informe seu **e-mail corporativo** e sua **senha**
3. Clique em **Entrar**
4. Você será direcionado automaticamente para o **Dashboard**

**Esqueci minha senha:** Entre em contato com o responsável técnico do sistema — o TeamFlow utiliza o Supabase Auth para gerenciamento de senhas.

**Sair do sistema:** Clique no ícone de saída (seta para a esquerda) no canto superior direito a qualquer momento.

---

## 4. Dashboard — Painel de Controle

O Dashboard é a **primeira tela** que aparece após o login. Ele foi projetado para dar uma visão completa da equipe em segundos.

### 4.1 Barra de alertas (sino 🔔)

No canto superior direito da tela há um ícone de sino. Se houver um número sobre ele, significa que existem **pendências que precisam de atenção**.

- **Vermelho:** situação crítica (férias vencidas ou colaborador sem promoção há mais de 24 meses)
- **Âmbar:** situação de atenção (férias vencendo em breve, sem promoção há mais de 18 meses)
- **Azul:** informativo (férias vencendo em 90 dias)

Clique no sino para ver a lista completa e ir diretamente ao colaborador em questão.

---

### 4.2 Indicadores de headcount (primeira linha)

| Indicador | O que significa |
|-----------|----------------|
| **Total ativo** | Número total de colaboradores que não estão desligados |
| **Júniores** | Quantidade de colaboradores no nível júnior (J1 a J4) e % do time |
| **Plenos** | Quantidade de colaboradores no nível pleno (P1 a P4) e % do time |
| **Sêniores** | Quantidade de colaboradores no nível sênior (S1 a S4) e % do time |
| **Afastados** | Colaboradores em férias + afastados (soma dos dois status) |

---

### 4.3 Indicadores de risco (segunda linha)

| Indicador | O que significa | Quando agir |
|-----------|----------------|-------------|
| **Férias vencidas** | Colaboradores cujo período de gozo venceu sem agendamento | **Imediatamente** — risco trabalhista e multa |
| **Férias vencendo em 90d** | Colaboradores com férias a vencer nos próximos 90 dias | Agendar em até 30 dias |
| **Sem promoção +18m** | Colaboradores que passaram 18 meses ou mais sem promoção | Avaliar elegibilidade para revisão de cargo |
| **Média sem promoção** | Média de meses sem promoção para toda a equipe ativa | Referência para saúde da política de carreira |

> **Regra CLT:** O colaborador tem direito a 30 dias de férias após 12 meses de trabalho (período aquisitivo). Essas férias devem ser gozadas nos 12 meses seguintes (período concessivo). Se não forem tiradas, vencem e a empresa pode ser obrigada a pagar em dobro.

---

### 4.4 Distribuição por nível

Este gráfico de barras mostra **quantos colaboradores existem em cada posição da grelha** (J1, J2, J3, J4, P1... S4).

**Como usar para tomada de decisão:**
- Se J1 e J2 têm muita gente e J3/J4 poucos → a base do time está crescendo, mas há gargalo de progressão
- Se S3 e S4 estão vazios → oportunidade para identificar colaboradores de alto potencial para promoção
- Use para planejar onde haverá vagas nos próximos meses conforme promoções acontecerem

---

### 4.5 Visão salarial

Mostra o **salário médio, mínimo e máximo** por nível de cargo (Júnior, Pleno, Sênior).

**Como usar:**
- Compara com a Grelha Salarial para identificar colaboradores fora da faixa
- Serve como base para conversas de reajuste com a direção
- A barra proporcional permite comparar visualmente a diferença entre os níveis

---

### 4.6 Pendências urgentes

Lista os colaboradores que precisam de ação, ordenados por prioridade:

| Cor | Tipo | Ação esperada |
|-----|------|---------------|
| 🔴 Vermelho | Férias vencidas / +24m sem promoção | Agir esta semana |
| 🟡 Âmbar | Férias vencendo em 30d / +18m sem promoção | Planejar ação em breve |
| 🔵 Azul | Férias vencendo em 90d | Monitorar |

Clique no nome do colaborador para ir diretamente à tela de detalhes.

---

### 4.7 Próximas férias agendadas

Lista os colaboradores com férias já agendadas, em ordem cronológica. Útil para planejar cobertura de equipe.

---

### 4.8 Aniversários de empresa (🎂)

Colaboradores que completam anos de empresa nos próximos 30 dias. Use para reconhecimento e engajamento.

---

### 4.9 Ações rápidas

Botões de acesso direto para as funções mais usadas: cadastrar colaborador, agendar férias, editar grelha e ver a lista completa.

---

## 5. Colaboradores

Esta tela lista todos os colaboradores e é o **centro de operações** do sistema.

### 5.1 Visão geral da lista

Cada linha da tabela mostra:
- **Nome e e-mail** do colaborador
- **Cargo** com badge de cor (âmbar = júnior, azul = pleno, roxo = sênior) e nível
- **Equipe** (visível em telas médias e grandes)
- **Tempo de empresa** (ex.: "3a 4m" = 3 anos e 4 meses)
- **Salário atual**
- **Tempo sem promoção** — em vermelho se crítico (+24m), em âmbar se atenção (+18m)
- **Status** com dropdown para alteração rápida

---

### 5.2 Busca e filtros

**Campo de busca:** pesquisa simultaneamente por nome, e-mail, equipe e gestor. Basta digitar — o sistema filtra automaticamente após uma pequena pausa.

**Filtros básicos (sempre visíveis):**
- Cargo (Júnior / Pleno / Sênior)
- Status (Ativo / Férias / Afastado / Desligado)

**Filtros avançados** (clique no botão "Filtros"):
- Nível (1 a 4)
- Equipe (lista das equipes cadastradas)
- Tempo sem promoção (> 6 / 12 / 18 / 24 meses)
- Faixa salarial (4 faixas pré-definidas)

**Chips de filtros ativos:** cada filtro aplicado aparece como um chip azul no topo. Clique no X do chip para remover apenas aquele filtro.

**Limpar tudo:** clique em "Limpar" para remover todos os filtros de uma vez.

---

### 5.3 Alterar status rapidamente

Na coluna Status, clique no badge colorido de qualquer colaborador e selecione o novo status. A alteração é salva instantaneamente, sem precisar abrir o cadastro.

| Status | Quando usar |
|--------|-------------|
| **Ativo** | Colaborador trabalhando normalmente |
| **Férias** | Colaborador em gozo de férias |
| **Afastado** | Licença médica, licença maternidade/paternidade, etc. |
| **Desligado** | Colaborador que saiu da empresa |

> Colaboradores desligados não aparecem nos alertas nem no Dashboard, mas ficam no histórico.

---

### 5.4 Ver detalhes de um colaborador

Clique em **"Ver →"** (aparece ao passar o mouse na linha) ou clique no **nome** do colaborador para abrir a tela de detalhes.

Na tela de detalhes você encontra:
- Informações pessoais e profissionais
- Controle de férias (período aquisitivo, vencimento e agendamento)
- Seção de promoção e reajuste com histórico completo
- Alertas personalizados para aquele colaborador

---

### 5.5 Cadastrar novo colaborador

1. Na lista de colaboradores, clique em **"+ Novo"** (canto superior direito)
2. Preencha os dados:

**Dados pessoais:**
- Nome completo (obrigatório)
- E-mail corporativo (obrigatório)
- Equipe / Área (obrigatório)
- Gestor responsável
- Status inicial (normalmente "Ativo")

**Posição na grelha:**
- Cargo macro: Júnior, Pleno ou Sênior (obrigatório)
- Nível: 1, 2, 3 ou 4 (obrigatório)
- O cargo completo é gerado automaticamente

**Datas e salário:**
- Data de admissão (obrigatório)
- Salário atual (obrigatório)
- Data do último reajuste (se houver)
- Data da última promoção (se houver)

**Previsões (opcional):**
- Próximo nível previsto (ex.: "pleno-1")
- Previsão de promoção (data estimada)

**Observações:** campo livre para anotações internas sobre o colaborador.

3. Clique em **"Cadastrar colaborador"**
4. O sistema redireciona para a tela de detalhes do novo colaborador

---

### 5.6 Editar dados de um colaborador

1. Abra a tela de detalhes do colaborador
2. Clique em **"Editar"** (canto superior direito do card)
3. Altere os campos desejados
4. Clique em **"Salvar alterações"**

> Use a edição para atualizar dados cadastrais (e-mail, equipe, gestor, observações). Para alterações de salário e cargo, use os modais específicos descritos abaixo.

---

### 5.7 Registrar reajuste salarial

Use esta função quando o colaborador receber aumento de salário **sem mudança de cargo**.

1. Abra a tela de detalhes do colaborador
2. Clique em **"+ Reajuste salarial"**
3. Confira o salário atual (campo bloqueado para leitura)
4. Informe o **novo salário**
5. Informe a **data do reajuste**
6. Informe o **motivo** (ex.: "Reajuste anual / INPC", "Mérito", "Equiparação")
7. Clique em **"Registrar"**

O sistema atualiza o salário automaticamente e salva o evento no histórico salarial.

---

### 5.8 Registrar promoção

Use esta função quando o colaborador mudar de cargo e/ou nível (com ou sem aumento salarial).

1. Abra a tela de detalhes do colaborador
2. Clique em **"+ Registrar promoção"**
3. Confira a posição atual
4. Selecione o **novo cargo macro** e o **novo nível**
5. O novo cargo completo é gerado automaticamente
6. Confira o salário anterior e informe o **novo salário**
7. Informe a **data da promoção**
8. Adicione observações (opcional)
9. Clique em **"Registrar"**

O sistema atualiza cargo, nível e salário, e salva o evento no histórico de promoções.

---

### 5.9 Excluir um colaborador

1. Abra a tela de detalhes do colaborador
2. Clique em **"Excluir"**
3. Um pedido de confirmação aparece — confirme digitando novamente
4. O colaborador e todo o histórico associado são removidos permanentemente

> ⚠️ **Atenção:** esta ação é irreversível. Prefira alterar o status para "Desligado" em vez de excluir, para manter o histórico.

---

### 5.10 Exportar para Excel

1. Na lista de colaboradores, aplique os filtros desejados
2. Clique no botão **"↓ Excel"** (barra de ações) ou **"↓ Exportar Excel"** (rodapé da tabela)
3. Um arquivo `.csv` será baixado — abra diretamente no Excel ou Google Sheets

O arquivo contém: nome, e-mail, cargo, nível, cargo completo, equipe, gestor, status, data de admissão, tempo de empresa, salário, dados de reajuste e promoção, e observações.

> O arquivo exportado **respeita os filtros ativos**. Para exportar toda a equipe, limpe os filtros antes de exportar.

---

## 6. Grelha Salarial

A grelha salarial define as **faixas de remuneração para cada cargo e nível** da empresa.

### 6.1 Como funciona a estrutura

A grelha é organizada em uma matriz de 12 posições:

| | Nível 1 | Nível 2 | Nível 3 | Nível 4 |
|---|---------|---------|---------|---------|
| **Júnior** | J1 | J2 | J3 | J4 |
| **Pleno** | P1 | P2 | P3 | P4 |
| **Sênior** | S1 | S2 | S3 | S4 |

Cada posição tem:
- **Faixa mínima:** menor salário aceitável para aquele cargo/nível
- **Faixa máxima:** maior salário praticado para aquele cargo/nível
- **Colaboradores:** quantas pessoas ocupam aquela posição atualmente

---

### 6.2 Como editar uma faixa salarial

1. Acesse **Grelha Salarial** no menu lateral
2. Localize a linha que deseja editar
3. Clique em **"Editar"** no final da linha
4. Informe o novo **mínimo** e **máximo**
5. Adicione uma observação (opcional, ex.: "Revisão anual 2025")
6. Clique em **"Salvar"**

> **Validações:** o sistema não aceita mínimo igual a zero, nem máximo menor que o mínimo.

---

### 6.3 Impacto das mudanças na grelha

Editar a grelha **não altera automaticamente** os salários dos colaboradores. A grelha serve como referência para:
- Validar se um colaborador está dentro da faixa do seu cargo
- Orientar decisões de reajuste e promoção
- Comunicar a política salarial da empresa

Se um colaborador estiver com salário abaixo do mínimo da sua posição após uma atualização da grelha, use a função de Reajuste Salarial para corrigir.

---

### 6.4 Ocupação por nível

Abaixo da tabela principal, há gráficos de barra mostrando **quantos colaboradores há em cada nível** dentro de cada cargo (Júnior, Pleno e Sênior). Útil para visualizar a distribuição do time.

---

## 7. Agenda de Férias

Esta tela concentra toda a gestão de férias da equipe.

### 7.1 Como funciona o controle de férias (CLT)

Cada colaborador acumula direito a férias a cada 12 meses de trabalho (período aquisitivo). As férias precisam ser gozadas nos 12 meses seguintes (período concessivo). Se não forem usadas dentro desse prazo, vencem.

**Resumo da regra:**
- Admissão em jan/2023 → período aquisitivo: jan/2023 a jan/2024
- Vencimento: jan/2025
- Se não tirar até jan/2025 → férias **vencidas**

O TeamFlow calcula isso automaticamente para cada colaborador.

---

### 7.2 Visão geral da tela de férias

Os cards no topo mostram:

| Card | Significado |
|------|------------|
| **Em andamento** | Colaboradores atualmente em férias |
| **Agendadas** | Com início agendado no futuro |
| **Não agendadas** | Têm férias a vencer mas sem data definida |
| **Vencendo em 90d** | Vencem nos próximos 90 dias — atenção |
| **Vencidas** | Já venceram — ação urgente necessária |

---

### 7.3 Registrar novo período aquisitivo

Quando um colaborador completar 12 meses de empresa (ou quando seu cadastro for feito tardiamente), registre o período:

1. Clique em **"+ Novo período"** (canto superior direito)
2. Selecione o colaborador
3. Informe a **data de início do período aquisitivo** (quando o colaborador completou 12 meses — normalmente a data de aniversário de empresa)
4. Clique em **"Registrar"**

O sistema calcula automaticamente:
- Fim do período aquisitivo (1 ano após o início)
- Data de vencimento (2 anos após o início)

---

### 7.4 Agendar férias de um colaborador

1. Na lista de férias, localize o colaborador (aparece nas seções "Vencidas", "Vencendo em 90d" ou "Não agendadas")
2. Clique em **"Agendar"** na linha do colaborador
3. Confira as informações do período aquisitivo e vencimento
4. Informe o **início das férias** e o **retorno**
5. Adicione observações (opcional)
6. Clique em **"Confirmar"**

---

### 7.5 Reagendar férias

Se as datas precisarem mudar:
1. Localize o colaborador na lista de agendadas
2. Clique em **"Reagendar"**
3. Atualize as datas
4. Clique em **"Confirmar"**

---

### 7.6 Marcar férias como concluídas

Após o colaborador retornar das férias:
1. Localize o colaborador
2. Clique em **"Reagendar"** (ou "Agendar")
3. No modal, clique em **"Marcar concluída"**

Isso remove o período da lista de pendências e atualiza o status.

---

### 7.7 Como agir sobre alertas de férias

**Férias vencidas (vermelho):**
1. Contate o colaborador e o RH imediatamente
2. Defina datas de gozo com urgência
3. Use a função "Agendar" para registrar as datas acordadas
4. Consulte o departamento jurídico se necessário

**Vencendo em 30 dias (âmbar):**
1. Inicie a conversa com o colaborador para definir datas
2. Registre o agendamento assim que as datas forem aprovadas

**Vencendo em 90 dias (atenção):**
1. Coloque no radar para planejar cobertura da equipe
2. Registre as datas quando forem definidas

---

## 8. Configurações

A tela de Configurações permite personalizar as **notificações por e-mail** do sistema.

### 8.1 Notificações por e-mail

O sistema pode enviar e-mails automáticos para alertar sobre situações críticas.

| Configuração | Descrição | Padrão |
|---|---|---|
| **Férias vencendo (dias)** | Quantos dias antes do vencimento enviar alerta | 90 dias |
| **Sem promoção (meses)** | A partir de quantos meses sem promoção alertar | 18 meses |
| **Aniversários (dias)** | Quantos dias antes do aniversário de empresa alertar | 30 dias |
| **E-mails ativos** | Liga/desliga os e-mails automáticos | Ativo |
| **Destinatários** | Lista de e-mails que receberão os alertas | - |

---

### 8.2 Como alterar as configurações

1. Acesse **Configurações** no menu lateral
2. Ajuste os valores desejados
3. Clique em **"Salvar configurações"**

---

### 8.3 Histórico de envios

Abaixo das configurações, há uma tabela com os últimos e-mails enviados pelo sistema. Útil para confirmar que as notificações estão funcionando.

---

## 9. Passo a passo operacional

### 9.1 Como cadastrar um novo colaborador

```
1. Menu lateral → Colaboradores
2. Botão "+ Novo" (canto superior direito)
3. Preencha: nome, e-mail, equipe, data de admissão, cargo e salário
4. Clique "Cadastrar colaborador"
5. Na tela de detalhes, registre as férias se houver período aquisitivo já vencido
```

---

### 9.2 Como promover um colaborador

```
1. Menu lateral → Colaboradores
2. Clique no nome do colaborador
3. Clique em "+ Registrar promoção"
4. Selecione o novo cargo e nível
5. Informe o novo salário e a data da promoção
6. Clique "Registrar"
```

✅ O histórico é salvo automaticamente.

---

### 9.3 Como ajustar o salário de um colaborador

```
1. Menu lateral → Colaboradores
2. Clique no nome do colaborador
3. Clique em "+ Reajuste salarial"
4. Informe o novo salário, data e motivo
5. Clique "Registrar"
```

---

### 9.4 Como identificar quem está com férias vencidas

```
Opção A — Dashboard:
  → Veja o card "Férias vencidas" na segunda linha de KPIs
  → Clique no card para ir para a Agenda de Férias
  → A seção "Férias vencidas" lista todos os casos

Opção B — Sino de alertas:
  → Clique no 🔔 no canto superior direito
  → Filtre pelos alertas com ícone 🔴 e tipo "Férias vencidas"
```

---

### 9.5 Como filtrar colaboradores por equipe

```
1. Menu lateral → Colaboradores
2. Clique em "Filtros" (ícone de ajustes)
3. No filtro "Equipe", selecione a equipe desejada
4. A lista filtra automaticamente
5. Exporte com "↓ Excel" se quiser salvar o resultado
```

---

### 9.6 Como usar o sistema semanalmente (rotina do gestor)

**Segunda-feira (5 minutos):**
1. Acesse o Dashboard
2. Verifique os alertas vermelhos — resolva na semana
3. Verifique os âmbares — agende conversas

**Quinzenalmente (10 minutos):**
1. Filtre colaboradores por "Sem promoção > 18 meses"
2. Revise elegibilidade para promoção
3. Exporte a lista para discussão com a liderança

**Mensalmente (15 minutos):**
1. Acesse Agenda de Férias
2. Verifique "Vencendo em 90d"
3. Acione colaboradores sem datas agendadas
4. Atualize períodos aquisitivos de quem completou 12 meses

---

### 9.7 Como ver o histórico completo de um colaborador

```
1. Menu lateral → Colaboradores
2. Clique no nome do colaborador
3. Role a página para baixo
4. Seção "Histórico de promoções": todas as promoções com datas e salários
5. Seção "Histórico salarial": todos os reajustes com motivos e datas
```

---

### 9.8 Como atualizar a grelha salarial após revisão anual

```
1. Menu lateral → Grelha Salarial
2. Para cada cargo/nível atualizado, clique em "Editar"
3. Informe os novos valores mínimo e máximo
4. Clique "Salvar"
5. Após atualizar toda a grelha, vá para Colaboradores
6. Filtre por cargo e verifique se há salários abaixo do novo mínimo
7. Use "Reajuste salarial" para corrigir os casos identificados
```

---

## 10. Importação em massa via CSV

Use a importação CSV para cadastrar vários colaboradores de uma só vez — ideal para uma carga inicial de dados.

### 10.1 Como importar

```
1. Menu lateral → Colaboradores
2. Clique em "↑ Importar CSV"
3. No modal, clique em "↓ Baixar modelo CSV" para obter o arquivo de exemplo
4. Preencha o arquivo com os dados dos colaboradores
5. Clique em "Selecionar arquivo CSV" e escolha o arquivo
6. Verifique a pré-visualização dos dados
7. Se houver erros, corrija o arquivo e recarregue
8. Clique "Importar (N)" para confirmar
```

---

### 10.2 Estrutura do arquivo CSV

O arquivo deve ter as seguintes colunas na **primeira linha** (cabeçalho):

| Coluna | Obrigatório | Formato | Exemplo |
|--------|:-----------:|---------|---------|
| `name` | ✅ | Texto livre | `João Silva` |
| `email` | ✅ | E-mail válido | `joao@empresa.com` |
| `macro_role` | ✅ | `junior`, `pleno` ou `senior` | `pleno` |
| `grid_level` | ✅ | `1`, `2`, `3` ou `4` | `2` |
| `team` | ✅ | Texto livre | `Suporte ao Cliente` |
| `manager` | ❌ | Texto livre | `Maria Gestora` |
| `admission_date` | ✅ | `AAAA-MM-DD` | `2023-01-15` |
| `current_salary` | ✅ | Número (ponto como decimal) | `5800.00` |
| `status` | ✅ | `active`, `vacation`, `leave` ou `terminated` | `active` |
| `notes` | ❌ | Texto livre | `Excelente performance` |

---

### 10.3 Exemplo de arquivo CSV

```csv
name,email,macro_role,grid_level,team,manager,admission_date,current_salary,status,notes
João Silva,joao@empresa.com,junior,1,Suporte ao Cliente,Maria Gestora,2024-01-15,3200,active,
Maria Santos,maria@empresa.com,pleno,2,Produtos,Carlos Silva,2022-06-01,6500,active,Ótima performance
Carlos Lima,carlos@empresa.com,senior,1,Engenharia,Ana Diretora,2021-03-10,9800,active,Tech lead
Beatriz Costa,beatriz@empresa.com,junior,3,Suporte ao Cliente,Maria Gestora,2023-08-20,4100,vacation,
```

---

### 10.4 Erros comuns e como corrigir

| Erro | Causa | Solução |
|------|-------|---------|
| "Colunas obrigatórias faltando" | O cabeçalho está incorreto | Baixe o modelo e refaça o arquivo |
| "macro_role inválido: 'Junior'" | Valores com maiúscula ou acento | Use exatamente: `junior`, `pleno`, `senior` |
| "Data de admissão inválida" | Data no formato errado | Use `AAAA-MM-DD` (ex.: `2023-01-15`) |
| "Salário inválido" | Vírgula como separador decimal | Use ponto: `5800.00`, não `5.800,00` |
| "E-mail inválido" | E-mail sem @ ou malformado | Verifique o e-mail de cada linha |

> O sistema valida **linha por linha** e mostra o número da linha com erro. Corrija o arquivo e reimporte.

---

## 11. Boas práticas para gestores

### 11.1 Frequência de uso recomendada

| Frequência | Ação |
|-----------|------|
| **Toda semana** | Verificar alertas no Dashboard e sino |
| **Toda quinzena** | Revisar colaboradores sem promoção |
| **Todo mês** | Verificar férias a vencer nos próximos 90 dias |
| **A cada 6 meses** | Revisar grelha salarial e comparar com mercado |
| **A cada ano** | Atualizar previsões de promoção para toda a equipe |

---

### 11.2 Organização dos dados

- **Use o campo "Equipe" de forma padronizada** — escreva sempre igual (ex.: `Suporte ao Cliente`, não `suporte` ou `Suporte`). Isso garante que os filtros funcionem corretamente.
- **Preencha sempre o gestor responsável** — facilita a busca e o contexto organizacional.
- **Registre promoções na data correta** — o sistema usa a data de promoção para calcular alertas futuros.
- **Use o campo "Observações"** para guardar informações importantes sobre o colaborador que não cabem em outros campos.

---

### 11.3 Gestão de promoções

- Configure a **previsão de promoção** ao cadastrar o colaborador. Isso ajuda a planejar revisões futuras.
- Quando o colaborador atingir a previsão, use a tela de detalhes para atualizar o cargo.
- O alerta de "sem promoção > 18 meses" é um gatilho para **abrir a conversa de carreira**, não necessariamente para promover imediatamente.
- Registre **todas** as promoções no sistema — mesmo as retroativas — para que o histórico esteja completo.

---

### 11.4 Acompanhamento de férias

- Registre o período aquisitivo assim que o colaborador completar 12 meses de empresa.
- Tente agendar férias com pelo menos **90 dias de antecedência** para facilitar a cobertura.
- Nunca ignore um alerta vermelho de férias vencidas — envolva o RH imediatamente.
- Antes de definir datas, consulte o calendário da equipe para evitar ausências simultâneas.

---

### 11.5 Exportação e relatórios

- Use a exportação Excel **antes de reuniões de avaliação** — filtre por equipe, exporte e use como base para a discussão.
- Para reuniões de orçamento, filtre por cargo e exporte para ter a visão salarial completa.
- Guarde as exportações mensais como histórico — o sistema não armazena snapshots anteriores da equipe.

---

*Documento gerado em abril de 2026 · TeamFlow v1.0*
