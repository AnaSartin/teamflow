# TeamFlow — Manual do Gestor

**Sistema de Gestão de Colaboradores · Adaptive**
Versão 1.1 · Abril de 2026 · Uso interno

---

## Sumário

1. [O que é o TeamFlow](#1-o-que-é-o-teamflow)
2. [Como acessar o sistema](#2-como-acessar-o-sistema)
3. [A tela inicial — Dashboard](#3-a-tela-inicial--dashboard)
4. [Colaboradores — a tela central](#4-colaboradores--a-tela-central)
5. [Cadastrar um novo colaborador](#5-cadastrar-um-novo-colaborador)
6. [Ficha do colaborador](#6-ficha-do-colaborador)
7. [Registrar promoção](#7-registrar-promoção)
8. [Registrar reajuste salarial](#8-registrar-reajuste-salarial)
9. [Grelha Salarial](#9-grelha-salarial)
10. [Agenda de Férias](#10-agenda-de-férias)
11. [Alertas e notificações por e-mail](#11-alertas-e-notificações-por-e-mail)
12. [Exportar e importar dados](#12-exportar-e-importar-dados)
13. [Boas práticas — rotina recomendada](#13-boas-práticas--rotina-recomendada)
14. [Perguntas frequentes](#14-perguntas-frequentes)

---

## 1. O que é o TeamFlow

O TeamFlow é o portal de gestão de colaboradores da Adaptive. Em vez de planilhas soltas e informações espalhadas, ele reúne tudo em um só lugar:

- Dados cadastrais completos de cada pessoa da equipe
- Histórico de promoções e reajustes salariais com datas e percentuais
- Controle de férias com monitoramento automático de vencimento (regra CLT)
- Grelha salarial da empresa — faixas mínima e máxima por cargo e nível
- Alertas automáticos por e-mail: férias a vencer, colaboradores sem promoção, aniversários de empresa
- Exportação da equipe para planilha Excel e importação em massa via CSV

O sistema foi pensado para ser **visual e prático**: as informações mais críticas aparecem logo na tela inicial sem que você precise navegar por vários menus para entender o estado da equipe.

**Endereço de acesso:** https://teamflow-pearl-seven.vercel.app

---

## 2. Como acessar o sistema

### 2.1 Fazer login

1. Abra o navegador e acesse: **https://teamflow-pearl-seven.vercel.app**
2. A tela de login será exibida automaticamente
3. Informe seu **e-mail corporativo** e sua **senha**
4. Clique em **Entrar**
5. Você será direcionado para o Dashboard

> Se for a primeira vez acessando, o usuário precisa ser criado pelo responsável técnico diretamente no painel do Supabase. O acesso inicial exige um convite enviado por e-mail.

### 2.2 Recuperar senha

Entre em contato com o responsável técnico (administrador do sistema). A redefinição de senha é feita pelo painel administrativo do Supabase — não existe link de "esqueci minha senha" no login por enquanto.

### 2.3 Sair do sistema

Clique no ícone de saída (seta para a esquerda) no canto superior direito da tela, ao lado do seu nome. A sessão é encerrada imediatamente.

### 2.4 Navegação

O menu fica na **barra lateral esquerda**:

| Item do menu | O que você encontra lá |
|---|---|
| **Dashboard** | Visão geral da equipe, KPIs e alertas |
| **Colaboradores** | Lista completa, busca, filtros, cadastro e exportação |
| **Grelha Salarial** | Estrutura de cargos e faixas salariais |
| **Agenda de Férias** | Controle de períodos aquisitivos e agendamentos |
| **Configurações** | Preferências de notificação por e-mail |

---

## 3. A tela inicial — Dashboard

O Dashboard é a **primeira tela que aparece após o login**. Ele foi projetado para dar uma visão completa da equipe em menos de um minuto.

### 3.1 Alerta de pendências críticas

Se houver situações urgentes, um aviso vermelho aparece no canto superior direito da tela: **"N pendência(s) crítica(s)"**. Isso indica que algum colaborador tem férias vencidas ou está sem promoção há mais de 24 meses.

O sino na barra superior também exibe quantos alertas existem. Clique nele para ver a lista completa com o nome de cada colaborador e o tipo de pendência.

### 3.2 Primeira fila de indicadores — Headcount

São cinco cards com os números mais básicos da equipe:

| Card | O que mostra |
|---|---|
| **Total ativo** | Total de colaboradores não desligados. Clique para abrir a lista. |
| **Juniores** | Quantidade de colaboradores Júnior e o percentual que representam |
| **Plenos** | Quantidade de colaboradores Pleno e o percentual que representam |
| **Seniores** | Quantidade de colaboradores Sênior e o percentual que representam |
| **Afastados** | Soma de colaboradores em férias e afastados (ex.: "2f + 1af") |

### 3.3 Segunda fila de indicadores — Alertas de gestão

São quatro cards que sinalizam situações que exigem atenção:

| Card | O que mostra | Quando agir |
|---|---|---|
| **Férias vencidas** | Colaboradores com férias fora do prazo legal (vermelho) | Imediatamente — risco trabalhista |
| **Férias vencendo em 90d** | Colaboradores com vencimento próximo (âmbar) | Agendar dentro de 30 dias |
| **Sem promoção +18m** | Colaboradores que passaram 18+ meses sem promoção | Avaliar elegibilidade para revisão de cargo |
| **Média sem promoção** | Média de meses sem promoção para toda a equipe ativa | Verde = dentro do alvo; âmbar = acima de 18 meses |

> **Regra CLT de férias:** todo colaborador tem direito a 30 dias de férias após 12 meses de trabalho (período aquisitivo). Essas férias precisam ser gozadas nos 12 meses seguintes. Se não forem tiradas nesse prazo, vencem — e a empresa pode ser obrigada a pagar em dobro. O TeamFlow monitora esse vencimento automaticamente.

### 3.4 Distribuição por nível

Este painel mostra quantas pessoas há em cada posição da grelha — de J1 a S4 — por meio de barras horizontais coloridas:

- Barras **amarelas** = Júnior (J1, J2, J3, J4)
- Barras **azuis** = Pleno (P1, P2, P3, P4)
- Barras **roxas** = Sênior (S1, S2, S3, S4)

Cada barra exibe o número absoluto e o percentual dentro daquele cargo.

**Como usar para decisões de carreira:**
- Muita gente em J1/J2 e pouca em J3/J4 → gargalo de progressão no time júnior
- S3 e S4 vazios → oportunidade de identificar pessoas de alto potencial para promoção
- Distribuição muito concentrada em um único nível → sinal para revisar a política de progressão

### 3.5 Visão salarial

Mostra o salário médio, mínimo e máximo por cargo (Júnior, Pleno, Sênior), além da média geral da empresa no canto superior direito. As barras são proporcionais entre os três grupos, facilitando a comparação visual. Use essa visão para:

- Comparar com a Grelha Salarial e identificar pessoas fora da faixa
- Preparar a pauta de reuniões de revisão orçamentária
- Acompanhar a evolução salarial da equipe ao longo do tempo

### 3.6 Pendências urgentes

Lista todos os colaboradores que precisam de ação, ordenados por prioridade — vermelho primeiro, depois âmbar, depois azul:

| Cor | Situação | O que fazer |
|---|---|---|
| Vermelho | Férias vencidas ou 24+ meses sem promoção | Agir esta semana |
| Âmbar | Férias vencendo em 30 dias ou 18+ meses sem promoção | Planejar ação em breve |
| Azul | Férias vencendo em 90 dias | Monitorar e planejar cobertura |

Clique no nome de qualquer colaborador para abrir a ficha dele diretamente.

### 3.7 Próximas férias agendadas

Lista os colaboradores com férias já aprovadas e com data definida, em ordem cronológica. Use para planejar a cobertura da equipe nos próximos meses. Clique em "Ver tudo" para abrir a Agenda de Férias completa.

### 3.8 Aniversários de empresa

Mostra quem completa anos de empresa nos próximos 30 dias. Use para reconhecimento e engajamento. Clique no nome para abrir a ficha do colaborador.

### 3.9 Ações rápidas

Quatro botões para as ações mais frequentes:
- **+ Novo colaborador** — abre o formulário de cadastro
- **Agendar férias** — vai para a Agenda de Férias
- **Editar grelha salarial** — vai para a Grelha Salarial
- **Ver todos os colaboradores** — vai para a lista completa

---

## 4. Colaboradores — a tela central

A tela de Colaboradores lista toda a equipe. É de onde você acessa o cadastro de cada pessoa, aplica filtros e exporta dados.

### 4.1 O que aparece na tabela

Cada linha mostra:

| Coluna | O que é |
|---|---|
| **Colaborador** | Nome completo, e-mail e avatar com iniciais |
| **Cargo** | Badge colorido com cargo macro e nível (ex.: "Pleno 2") |
| **Equipe** | Área ou time do colaborador |
| **Tempo** | Tempo de empresa calculado automaticamente (ex.: "3a 4m") |
| **Salário** | Salário atual formatado em reais |
| **S/ promoção** | Meses desde a última promoção — vermelho se 24+ meses, âmbar se 18+ meses |
| **Status** | Dropdown para alterar o status diretamente na lista |
| **Ver** | Aparece ao passar o mouse — abre a ficha do colaborador |

### 4.2 Busca

O campo de busca pesquisa em quatro campos ao mesmo tempo: nome, e-mail, equipe e gestor. Basta começar a digitar — a lista se atualiza após uma breve pausa.

Exemplos:
- Digitar `João` mostra todos os colaboradores chamados João
- Digitar `Produto` mostra colaboradores da equipe Produto e também gestores com "Produto" no nome
- Digitar `joao@adaptive` encontra pelo e-mail

### 4.3 Filtros básicos

Sempre visíveis abaixo da barra de busca:
- **Cargo:** Júnior / Pleno / Sênior
- **Status:** Ativo / Férias / Afastado / Desligado

### 4.4 Filtros avançados

Clique no botão **Filtros** para expandir opções adicionais:

- **Nível:** N1, N2, N3 ou N4 — filtra dentro de um cargo (ex.: só Pleno N2)
- **Equipe:** lista exata das equipes cadastradas no sistema
- **Sem promoção há mais de:** opções de 6, 12, 18 ou 24 meses
- **Faixa salarial:** quatro faixas predefinidas para segmentar por remuneração

Cada filtro aplicado aparece como um chip azul abaixo dos filtros. Clique no X de qualquer chip para removê-lo individualmente. O botão **Limpar** remove todos de uma vez.

### 4.5 Alterar o status sem abrir a ficha

Na coluna Status, clique no badge colorido de qualquer colaborador e selecione o novo status no dropdown. A alteração é salva imediatamente.

| Status | Quando usar |
|---|---|
| **Ativo** | Colaborador trabalhando normalmente |
| **Férias** | Colaborador em gozo de férias |
| **Afastado** | Licença médica, licença-maternidade, licença-paternidade etc. |
| **Desligado** | Colaborador que saiu da empresa |

> Colaboradores desligados não aparecem nos cards do Dashboard, nos alertas nem nas férias. Eles ficam no banco de dados e podem ser encontrados filtrando por "Desligado" na lista.

---

## 5. Cadastrar um novo colaborador

### 5.1 Onde encontrar

Na tela de Colaboradores, clique em **+ Novo** no canto superior direito.

### 5.2 Preenchendo o formulário

O formulário está dividido em blocos lógicos:

**Dados pessoais e profissionais**

| Campo | Obrigatório | Dica |
|---|:---:|---|
| Nome completo | Sim | Como aparece em todos os relatórios e históricos |
| E-mail corporativo | Sim | Único por colaborador — não pode duplicar |
| Equipe / Área | Sim | Use sempre o mesmo formato (ex.: "Suporte ao Cliente", não "suporte" nem "SAC") |
| Gestor responsável | Não | Nome do gestor direto |
| Status | Sim | Normalmente "Ativo" ao cadastrar |

**Posição na grelha**

| Campo | Obrigatório | Dica |
|---|:---:|---|
| Cargo macro | Sim | Júnior, Pleno ou Sênior |
| Nível | Sim | 1, 2, 3 ou 4 |

O sistema gera automaticamente o cargo completo (ex.: "Analista Pleno N2") a partir dessas duas escolhas.

**Datas e salário**

| Campo | Obrigatório | Dica |
|---|:---:|---|
| Data de admissão | Sim | Data real de entrada na empresa |
| Salário atual | Sim | Valor bruto mensal — aceita centavos (ex.: 6.850,50) |
| Data do último reajuste | Não | Preencha se o colaborador já tiver histórico anterior |
| Data da última promoção | Não | Preencha se o colaborador já tiver histórico anterior |

**Previsões de carreira (opcional)**

- **Próximo nível previsto:** ex.: `pleno-3` — serve para planejamento de carreira
- **Data prevista para promoção:** gera um alerta quando a data se aproximar

**Observações:** campo livre para anotações internas sobre o colaborador. Não é visível para o colaborador.

### 5.3 Finalizando o cadastro

Clique em **Cadastrar colaborador**. O sistema redireciona automaticamente para a ficha do novo colaborador.

> **Próximo passo importante:** se o colaborador já completou 12 meses de empresa, registre o período aquisitivo de férias. Acesse a Agenda de Férias, clique em **+ Novo período** e vincule ao colaborador recém-cadastrado.

---

## 6. Ficha do colaborador

A ficha é a tela de detalhes de cada pessoa. Para acessá-la, clique no nome do colaborador na lista ou passe o mouse sobre a linha e clique em **Ver**.

### 6.1 Alertas no topo

Se houver situações urgentes, um banner colorido aparece no topo da ficha:

- **Vermelho:** "Férias vencidas há N dias. Agendar imediatamente."
- **Âmbar (férias):** "Férias vencem em N dias. Considere agendar." (quando faltam menos de 60 dias)
- **Âmbar (promoção):** "N meses sem promoção. Colaborador pode estar elegível para revisão." (a partir de 18 meses)

### 6.2 Cabeçalho

Mostra nome, cargo completo (ex.: "Analista Pleno N2"), badge de cargo, badge de nível e badge de status. Os botões **Editar** e **Excluir** ficam no canto superior direito.

### 6.3 Informações principais

Card com os dados cadastrais:
- E-mail, equipe, gestor
- Data de admissão e tempo de empresa calculado automaticamente
- Salário atual, data do último reajuste e há quanto tempo ocorreu

### 6.4 Controle de férias

Card com o status do período aquisitivo ativo:
- Período aquisitivo (início e fim)
- Data de vencimento
- Dias restantes até o vencimento — ou há quantos dias venceu
- Férias agendadas (início e fim, se houver)

Se não houver período registrado, um link direto para a Agenda de Férias é exibido.

### 6.5 Promoção e reajuste

Painel com quatro informações em destaque:
- Data da última promoção
- Quantos meses se passaram desde então
- Próximo nível previsto (se preenchido no cadastro)
- Data prevista para a próxima promoção

Os botões **+ Registrar promoção** e **+ Reajuste salarial** ficam neste painel.

### 6.6 Histórico de promoções

Timeline com todas as promoções do colaborador na empresa:
- Data da promoção
- Cargo anterior → Cargo novo (ex.: "Analista Júnior N3 → Analista Pleno N1")
- Salário antes e depois, com percentual de aumento calculado automaticamente
- Observações registradas no momento da promoção

### 6.7 Histórico salarial

Timeline com todos os reajustes de salário:
- Data
- Novo valor
- Motivo registrado (ex.: "Reajuste anual IPCA 2026")

### 6.8 Editar dados do colaborador

Clique em **Editar** para abrir o formulário de edição. Use para atualizar e-mail, equipe, gestor, observações ou qualquer dado cadastral. Para mudanças de salário e cargo, prefira os modais específicos de reajuste e promoção — eles registram o histórico automaticamente.

### 6.9 Excluir colaborador

Clique em **Excluir** e confirme na janela que aparece. A exclusão remove o colaborador e todo o histórico associado (promoções, salários, férias) de forma permanente.

> **Recomendação:** prefira alterar o status para **Desligado** em vez de excluir. Isso preserva o histórico para consulta futura e mantém o colaborador na base para fins de auditoria e LGPD.

---

## 7. Registrar promoção

Use quando o colaborador mudar de cargo e/ou nível — com ou sem aumento salarial associado.

**Passo a passo:**

1. Abra a ficha do colaborador
2. No painel "Promoção & reajuste", clique em **+ Registrar promoção**
3. O modal abre mostrando a posição atual do colaborador
4. Selecione o **novo cargo macro** (Júnior / Pleno / Sênior) e o **novo nível** (1 / 2 / 3 / 4)
5. O cargo completo é gerado automaticamente na tela
6. Informe o **novo salário** (pode ser igual ao anterior se não houver aumento neste momento)
7. Informe a **data da promoção** — use a data real, mesmo que seja retroativa
8. Adicione observações se quiser (ex.: "Resultado do ciclo de avaliação Q1/2026")
9. Clique em **Registrar**

O sistema atualiza cargo, nível e salário na ficha e salva o evento no histórico de promoções com o percentual de aumento calculado automaticamente.

**Diferença entre promoção e reajuste:**

| Situação | Use |
|---|---|
| Mudança de cargo ou nível (J2 → J3, Júnior → Pleno) | Promoção |
| Aumento de salário sem mudança de cargo | Reajuste salarial |
| Reajuste por IPCA ou mérito, mesmo cargo | Reajuste salarial |
| Promoção com aumento de salário simultâneo | Promoção (o salário novo é informado no mesmo modal) |

> **Dica:** registre todas as promoções — inclusive as retroativas ou as de ajuste de nomenclatura. Histórico completo é muito mais útil do que histórico seletivo.

---

## 8. Registrar reajuste salarial

Use quando o colaborador receber aumento de salário **sem mudança de cargo ou nível**.

**Passo a passo:**

1. Abra a ficha do colaborador
2. No painel "Promoção & reajuste", clique em **+ Reajuste salarial**
3. O modal exibe o salário atual (somente leitura — para referência)
4. Informe o **novo salário**
5. Informe a **data do reajuste**
6. Informe o **motivo** — seja descritivo, pois fica no histórico

Exemplos de motivo bem escritos:
- "Reajuste anual IPCA 2026 — 4,83%"
- "Reajuste por mérito — avaliação semestral jun/2026"
- "Equiparação salarial — alinhamento de faixa após revisão da grelha"
- "Reajuste retroativo a partir de 01/01/2026"

7. Clique em **Registrar**

O salário é atualizado na ficha e o evento é salvo no histórico salarial.

---

## 9. Grelha Salarial

A Grelha Salarial define as faixas de remuneração para cada cargo e nível da Adaptive. É a referência oficial para decidir se um salário está adequado e para calibrar promoções e reajustes.

### 9.1 A estrutura da grelha

A grelha tem 12 posições, organizadas em uma tabela:

|  | Nível 1 | Nível 2 | Nível 3 | Nível 4 |
|---|---|---|---|---|
| **Júnior** | J1 | J2 | J3 | J4 |
| **Pleno** | P1 | P2 | P3 | P4 |
| **Sênior** | S1 | S2 | S3 | S4 |

Cada posição exibe:
- **Cargo completo** (ex.: "Analista Pleno N2")
- **Faixa mínima** — menor salário aceitável para esse cargo/nível
- **Faixa máxima** — teto praticado para esse cargo/nível
- **Colaboradores** — quantas pessoas ocupam essa posição atualmente
- **Observações** — campo livre para anotar contexto (ex.: "Revisão anual abr/2026")

### 9.2 Editar uma faixa salarial

1. Acesse **Grelha Salarial** no menu lateral
2. Localize a linha que deseja atualizar
3. Clique em **Editar** no final da linha
4. No modal, informe o novo **mínimo** e o novo **máximo**
5. Adicione uma observação (recomendado: data e motivo da revisão)
6. Clique em **Salvar**

O sistema valida que o mínimo é maior que zero e que o máximo é maior que o mínimo antes de salvar.

### 9.3 Importante: a grelha não altera salários automaticamente

Atualizar a grelha **não muda** o salário de nenhum colaborador. Ela serve como referência — é você quem decide, caso a caso, se algum colaborador precisa ser reajustado para se enquadrar na nova faixa.

**Fluxo recomendado após revisão anual da grelha:**

```
1. Atualize todas as faixas na Grelha Salarial
2. Vá para Colaboradores
3. Filtre por cargo (Júnior, depois Pleno, depois Sênior)
4. Compare o salário de cada pessoa com a nova faixa mínima
5. Use "Reajuste salarial" nos casos abaixo do novo mínimo
```

### 9.4 Ocupação por nível

Abaixo da tabela principal, três cards (um por cargo macro) mostram barras com quantas pessoas há em cada nível. Use para identificar onde o time está concentrado e onde há espaço para crescimento.

---

## 10. Agenda de Férias

A Agenda de Férias centraliza o controle de todos os períodos aquisitivos e agendamentos da equipe.

### 10.1 Como funciona o ciclo de férias (CLT)

```
Admissão em 15/01/2024
       ↓
Período aquisitivo: 15/01/2024 até 15/01/2025
       ↓
Período concessivo: 15/01/2025 até 15/01/2026
       ↓
Vencimento: 15/01/2026
```

O colaborador tem 12 meses para gozar as férias depois de completar o período aquisitivo. Se não gozar até o vencimento, as férias vencem — e a empresa corre o risco de ter que pagar em dobro.

O TeamFlow registra o início do período aquisitivo e **calcula automaticamente** a data de fim do período e o vencimento.

**Duração das férias:** pela CLT, o colaborador pode tirar as férias em até 3 parcelas (30, 20 ou 10 dias). O TeamFlow registra um período por vez — para parcelar, registre múltiplos períodos com diferentes datas de início e retorno.

### 10.2 Os cards de resumo

No topo da tela, cinco cards mostram o estado atual:

| Card | O que significa |
|---|---|
| **Em andamento** | Colaboradores que estão de férias agora |
| **Agendadas** | Com datas definidas para o futuro |
| **Não agendadas** | Têm período aquisitivo registrado, mas sem data marcada |
| **Vencendo em 90d** | Vencem nos próximos 90 dias — atenção necessária |
| **Vencidas** | Já venceram — ação urgente |

### 10.3 Seções da página

A página divide os períodos em grupos:

- **Férias vencidas** (borda vermelha) — ação imediata
- **Vencendo em breve** — colaboradores com vencimento nos próximos 90 dias
- **Em andamento** — quem está de férias agora
- **Agendadas** — agrupadas por mês de início
- **Não agendadas** — têm período registrado mas sem datas definidas

### 10.4 Registrar um novo período aquisitivo

Quando um colaborador completa 12 meses de empresa, registre o período para que o sistema monitore o vencimento.

1. Clique em **+ Novo período** no canto superior direito
2. Selecione o colaborador no dropdown
3. Informe a **data de início do período aquisitivo** — normalmente a data de admissão do colaborador (para o primeiro período) ou a data de admissão + 12 meses (para os períodos seguintes)
4. Clique em **Registrar**

O sistema calcula automaticamente:
- Fim do período aquisitivo (1 ano após o início)
- Data de vencimento (2 anos após o início do período aquisitivo)

### 10.5 Agendar as férias de um colaborador

1. Localize o colaborador na seção "Vencidas", "Vencendo em breve" ou "Não agendadas"
2. Clique em **Agendar** na linha do colaborador
3. O modal exibe as informações do período: datas de aquisição, vencimento e dias restantes
4. Informe o **início das férias** e a **data de retorno**
5. Adicione observações, se quiser (ex.: "Aprovado em reunião 10/04")
6. Clique em **Confirmar**

### 10.6 Reagendar férias

Se as datas precisarem mudar após o agendamento inicial:

1. Localize o colaborador na seção "Agendadas"
2. Clique em **Reagendar**
3. Atualize as datas
4. Clique em **Confirmar**

### 10.7 Encerrar um período de férias

Quando o colaborador retornar do período de férias:

1. Localize o colaborador na seção "Em andamento" ou "Agendadas"
2. Clique em **Reagendar**
3. No modal, clique em **Marcar concluída**

Isso remove o período das pendências ativas e atualiza o status para concluído.

### 10.8 O que fazer quando as férias vencem

**Vermelho = risco trabalhista.** Ao ver um colaborador na seção "Férias vencidas":

1. Entre em contato com o colaborador e com o RH o mais rápido possível
2. Defina datas para o gozo com caráter de urgência
3. Registre o agendamento usando a função "Agendar"
4. Em caso de dúvida sobre como regularizar, consulte o departamento jurídico ou de compliance

> **Atenção:** o TeamFlow registra e alerta, mas não regulariza a situação automaticamente. A ação precisa ser sua.

---

## 11. Alertas e notificações por e-mail

Acesse **Configurações** no menu lateral para personalizar os alertas automáticos por e-mail.

### 11.1 O que o sistema envia por e-mail

| Tipo de alerta | O que dispara | Padrão |
|---|---|---|
| Férias a vencer | Quando faltam N dias para o vencimento | 90 dias |
| Sem promoção | Quando o colaborador passa de N meses sem promoção | 18 meses |
| Aniversários de empresa | Quando faltam N dias para o aniversário | 30 dias |

### 11.2 Como alterar as configurações

1. Ajuste os valores desejados nos campos
2. Ligue ou desligue cada tipo de e-mail individualmente com o toggle
3. Verifique e atualize a lista de destinatários, se necessário
4. Clique em **Salvar configurações**

### 11.3 Histórico de envios

Abaixo das configurações há uma tabela com os últimos e-mails disparados. Use para confirmar que as notificações estão sendo enviadas corretamente.

### 11.4 Quando os e-mails são enviados

Os alertas automáticos são enviados toda **segunda a sexta-feira às 8h UTC (5h de Brasília)** pelo sistema de agendamento automático da Vercel.

> **Nota:** os e-mails dependem do serviço de envio (Resend) estar configurado com credenciais válidas. Se não estiver recebendo os alertas, entre em contato com o responsável técnico do sistema.

---

## 12. Exportar e importar dados

### 12.1 Exportar a lista para Excel

O botão de exportação respeita os filtros ativos no momento — você exporta exatamente o que está vendo na tela.

1. Na tela de Colaboradores, aplique os filtros desejados (ou deixe sem filtros para exportar tudo)
2. Clique em **Exportar Excel** no topo da tela ou no rodapé da tabela
3. Um arquivo `.csv` será baixado automaticamente
4. Abra no Excel ou no Google Sheets — o arquivo usa codificação UTF-8 com BOM, garantindo que acentos e caracteres especiais apareçam corretamente

O arquivo exportado contém 18 colunas: nome, e-mail, cargo completo, cargo macro, nível, equipe, gestor, status, data de admissão, tempo de empresa, salário atual, data do último reajuste, meses desde o reajuste, data da última promoção, meses desde a promoção, próximo nível previsto, previsão de promoção e observações.

### 12.2 Importar colaboradores em massa (CSV)

Use para cadastrar vários colaboradores de uma só vez — ideal para a carga inicial de dados ao implantar o sistema.

**Passo a passo:**

1. Na tela de Colaboradores, clique em **Importar CSV**
2. No modal, clique em **Baixar modelo CSV** para obter o arquivo de exemplo com o cabeçalho correto
3. Abra o arquivo no Excel ou Google Sheets e preencha os dados
4. Salve como `.csv`
5. Clique em **Selecionar arquivo CSV** e escolha o arquivo
6. O sistema exibe uma pré-visualização com os dados e eventuais erros por linha
7. Se houver erros, corrija o arquivo e carregue novamente
8. Quando a pré-visualização estiver sem erros, clique em **Importar**

### 12.3 Estrutura do arquivo CSV

O arquivo deve ter as seguintes colunas no cabeçalho:

| Coluna | Obrigatório | Formato aceito | Exemplo |
|---|:---:|---|---|
| `name` | Sim | Texto | `João Silva` |
| `email` | Sim | E-mail válido | `joao@adaptive.com.br` |
| `macro_role` | Sim | `junior`, `pleno` ou `senior` | `pleno` |
| `grid_level` | Sim | `1`, `2`, `3` ou `4` | `2` |
| `team` | Sim | Texto | `Produto` |
| `manager` | Não | Texto | `Ana Sartin` |
| `admission_date` | Sim | `AAAA-MM-DD` | `2023-01-15` |
| `current_salary` | Sim | Número com ponto decimal | `6500.00` |
| `status` | Sim | `active`, `vacation`, `leave` ou `terminated` | `active` |
| `notes` | Não | Texto livre | `Tech lead do squad` |

### 12.4 Erros mais comuns ao importar

| Mensagem de erro | Causa provável | Como corrigir |
|---|---|---|
| "Colunas obrigatórias faltando" | Cabeçalho incorreto ou ausente | Baixe o modelo e refaça o arquivo a partir dele |
| "macro_role inválido: 'Junior'" | Valor com maiúscula ou em português | Use exatamente: `junior`, `pleno` ou `senior` |
| "Data de admissão inválida" | Data no formato errado | Use o formato `AAAA-MM-DD` — ex.: `2023-01-15` |
| "Salário inválido" | Vírgula usada como separador decimal | Use ponto: escreva `6500.00`, não `6.500,00` |
| "E-mail inválido" | E-mail sem @ ou malformado | Verifique o e-mail de cada linha afetada |
| "status inválido: 'Ativo'" | Valor em português ou com maiúscula | Use exatamente: `active`, `vacation`, `leave` ou `terminated` |

O sistema valida linha por linha e indica o número de cada linha com problema. Corrija o arquivo e reimporte.

---

## 13. Boas práticas — rotina recomendada

O TeamFlow é mais eficiente quando usado com regularidade. Sugerimos esta rotina:

### Toda segunda-feira (5 minutos)

1. Acesse o Dashboard
2. Verifique se há o aviso de "pendências críticas" no topo direito da tela
3. Abra o sino e revise os alertas vermelhos — planeje como resolver cada um na semana
4. Veja os alertas âmbares — agende conversas com os colaboradores em questão

### Quinzenalmente (10 minutos)

1. Vá para Colaboradores
2. Filtre por "Sem promoção há mais de 18 meses"
3. Revise quem pode estar elegível para revisão de cargo ou salário
4. Exporte a lista para levar para a próxima reunião de liderança, se necessário

### Todo mês (15 minutos)

1. Acesse a Agenda de Férias
2. Veja o card "Vencendo em 90d"
3. Entre em contato com os colaboradores desse grupo que ainda não têm férias agendadas
4. Registre novos períodos aquisitivos para colaboradores que completaram 12 meses no período

### A cada 6 meses

1. Revise a Grelha Salarial com base em pesquisas de mercado
2. Compare com os salários praticados (visão salarial no Dashboard)
3. Use os filtros por cargo para identificar pessoas fora da faixa
4. Aplique reajustes onde necessário usando a função "Reajuste salarial"

### Cuidados com dados sensíveis

- O sistema contém dados pessoais e salariais dos colaboradores — acesse apenas de dispositivos corporativos ou pessoais seguros
- Nunca compartilhe os exportes CSV com pessoas não autorizadas; eles contêm salários individuais
- Ao desligar um colaborador, prefira marcar como "Desligado" em vez de excluir — preserva o histórico
- Informe ao responsável técnico imediatamente se perceber qualquer acesso não autorizado

---

## 14. Perguntas frequentes

**Por que um colaborador não aparece nos alertas mesmo estando há muito tempo sem promoção?**
O sistema monitora apenas colaboradores com status "Ativo", "Férias" ou "Afastado". Colaboradores desligados não geram alertas.

---

**Posso cadastrar dois colaboradores com o mesmo e-mail?**
Não. O e-mail é único por colaborador. Se houver e-mail duplicado no CSV durante a importação, a linha será rejeitada com erro.

---

**O que acontece se eu editar o salário diretamente pelo formulário de edição, em vez de usar "Reajuste salarial"?**
O salário será atualizado, mas o evento não será registrado no histórico salarial. Use sempre "Reajuste salarial" ou "Registrar promoção" para manter o histórico completo.

---

**Posso registrar uma promoção com data retroativa?**
Sim. O campo de data é livre — informe a data real da promoção, mesmo que tenha acontecido antes de hoje. O histórico ficará correto.

---

**A grelha salarial muda o salário dos colaboradores automaticamente quando edito as faixas?**
Não. A grelha é apenas referência. Para ajustar salários, use "Reajuste salarial" colaborador a colaborador.

---

**Por que não estou recebendo os e-mails automáticos de alerta?**
Os e-mails dependem do serviço Resend estar configurado com credenciais válidas (`RESEND_API_KEY`, `RESEND_FROM_EMAIL` e `EMAIL_MANAGER`). Entre em contato com o responsável técnico para verificar se essas configurações estão ativas em produção.

---

**Posso ter mais de um usuário com acesso ao sistema?**
Sim. Cada usuário precisa ser criado pelo administrador no painel do Supabase em **Authentication → Users → Invite user**. Todos os usuários veem os dados de toda a equipe — não há divisão de permissão por usuário nesta versão.

---

**O que significa "período aquisitivo" e "período concessivo"?**
Período aquisitivo é o ano em que o colaborador está acumulando o direito às férias (os primeiros 12 meses de trabalho, ou cada ciclo seguinte). Período concessivo são os 12 meses seguintes, durante os quais as férias precisam ser gozadas. Se não forem usadas no período concessivo, vencem.

---

**Posso exportar apenas uma equipe específica?**
Sim. Aplique o filtro de equipe na tela de Colaboradores antes de clicar em "Exportar Excel". A exportação respeitará o filtro ativo.

---

**O que é o "audit log"?**
É um registro automático de todas as ações realizadas no sistema: criação e edição de colaboradores, promoções, reajustes, mudanças de status, edições na grelha e agendamentos de férias. Cada registro guarda data, hora, usuário responsável e os dados alterados. Isso garante rastreabilidade total para fins de compliance e LGPD.

---

*TeamFlow v1.1 · Adaptive · Abril de 2026 · Uso interno — não distribuir*
