# TeamFlow — Manual do Gestor

**Sistema de Gestão de Colaboradores · Adaptive**
Versão 1.0 · Abril de 2026 · Uso interno

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
11. [Configurações de notificação](#11-configurações-de-notificação)
12. [Exportar e importar dados](#12-exportar-e-importar-dados)
13. [Rotina semanal recomendada](#13-rotina-semanal-recomendada)
14. [Perguntas frequentes](#14-perguntas-frequentes)

---

## 1. O que é o TeamFlow

O TeamFlow é o sistema de gestão de colaboradores da Adaptive. Ele reúne em um único lugar tudo o que um gestor precisa acompanhar sobre a sua equipe:

- Dados cadastrais de cada colaborador
- Histórico de promoções e reajustes salariais
- Controle de férias com alertas automáticos de vencimento
- Grelha salarial da empresa (faixas por cargo e nível)
- Alertas de situações que precisam de atenção
- Exportação da equipe para planilha Excel

O sistema foi pensado para ser **visual e prático**: as informações mais importantes aparecem logo na tela inicial, sem que você precise navegar por vários menus para entender o estado da equipe.

**Endereço:** https://teamflow-pearl-seven.vercel.app

---

## 2. Como acessar o sistema

### 2.1 Fazer login

1. Abra o navegador e acesse: **https://teamflow-pearl-seven.vercel.app**
2. A tela de login será exibida
3. Informe seu **e-mail corporativo** e sua **senha**
4. Clique em **Entrar**
5. Você será direcionado automaticamente para o Dashboard

> Se for a primeira vez que está acessando, peça ao responsável pelo sistema que crie seu usuário no Supabase. O acesso inicial exige um convite.

### 2.2 Recuperar senha

Entre em contato com o responsável técnico (TI ou administrador do sistema). O TeamFlow usa o serviço Supabase Auth — a redefinição de senha é feita pelo painel administrativo, não há link de "esqueci minha senha" no login.

### 2.3 Sair do sistema

Clique no ícone de saída (seta para a esquerda) no canto superior direito da tela, ao lado do seu nome. Isso encerra a sessão imediatamente.

### 2.4 Navegação

O menu está na barra lateral esquerda:

| Item do menu | O que você encontra lá |
|---|---|
| **Dashboard** | Visão geral da equipe, alertas e indicadores |
| **Colaboradores** | Lista completa, busca, filtros, cadastro e exportação |
| **Grelha Salarial** | Estrutura de cargos e faixas salariais |
| **Agenda de Férias** | Controle de períodos aquisitivos e agendamentos |
| **Configurações** | Preferências de notificação por e-mail |

---

## 3. A tela inicial — Dashboard

O Dashboard é a **primeira tela que aparece após o login**. Ele foi projetado para dar uma visão completa da equipe em menos de um minuto.

### 3.1 Alerta de pendências críticas

Se houver alguma situação urgente na equipe, um aviso vermelho piscando aparece no canto superior direito da tela: **"N pendência(s) crítica(s)"**. Isso significa que algum colaborador tem férias vencidas ou está sem promoção há mais de 24 meses.

Além disso, o sino 🔔 na barra superior sempre mostra quantos alertas existem. Clique nele para ver a lista completa.

---

### 3.2 Primeira fila de indicadores — Headcount

São cinco cards com os números mais básicos da equipe:

| Card | O que mostra |
|---|---|
| **Total ativo** | Total de colaboradores que não estão desligados. Clique para ir à lista. |
| **Júniores** | Quantidade de colaboradores Júnior e qual % do time representam |
| **Plenos** | Quantidade de colaboradores Pleno e qual % do time representam |
| **Sêniores** | Quantidade de colaboradores Sênior e qual % do time representam |
| **Afastados** | Soma de colaboradores em férias e afastados (ex.: "2f + 1af") |

---

### 3.3 Segunda fila de indicadores — Alertas de gestão

São quatro cards que sinalizam situações que exigem sua atenção:

| Card | O que mostra | Quando agir |
|---|---|---|
| **Férias vencidas** | Colaboradores com férias fora do prazo legal (vermelho) | Imediatamente — risco trabalhista |
| **Férias vencendo em 90d** | Colaboradores com vencimento próximo (âmbar) | Agendar em até 30 dias |
| **Sem promoção +18m** | Colaboradores que passaram 18 meses ou mais sem promoção | Avaliar elegibilidade para revisão de cargo |
| **Média sem promoção** | Média de meses sem promoção para toda a equipe ativa | Verde = dentro do alvo, âmbar = acima de 18 meses |

> **Regra CLT de férias:** todo colaborador tem 30 dias de férias após 12 meses de trabalho (período aquisitivo). Essas férias precisam ser gozadas nos 12 meses seguintes. Se não forem usadas nesse prazo, vencem — e a empresa pode ser obrigada a pagar em dobro. O TeamFlow monitora esse vencimento automaticamente para cada pessoa.

---

### 3.4 Distribuição por nível

Este painel mostra **quantas pessoas existem em cada posição da grelha** — de J1 a S4 — através de barras horizontais coloridas:

- Barras **âmbar** = Júnior (J1, J2, J3, J4)
- Barras **azuis** = Pleno (P1, P2, P3, P4)
- Barras **roxas** = Sênior (S1, S2, S3, S4)

Cada barra mostra o número absoluto e o percentual dentro daquele cargo.

**Como usar para decisões de carreira:**
- Muita gente em J1/J2 e pouca em J3/J4 → gargalo de progressão no time júnior
- S3 e S4 vazios → oportunidade de identificar pessoas de alto potencial para promoção
- Distribuição muito concentrada em um nível → sinal para revisar política de progressão

---

### 3.5 Visão salarial

Mostra o **salário médio, mínimo e máximo** por nível de cargo (Júnior, Pleno, Sênior), além da média geral da empresa no canto superior direito.

As barras são proporcionais entre os três grupos, facilitando a comparação visual. Use essa visão para:
- Comparar com a Grelha Salarial e identificar pessoas fora da faixa
- Preparar a pauta de reuniões de revisão orçamentária
- Comunicar a evolução salarial da empresa ao longo do tempo

---

### 3.6 Pendências urgentes

Lista todos os colaboradores que precisam de ação, ordenados por prioridade — vermelho primeiro, depois âmbar, depois azul:

| Cor | Situação | O que fazer |
|---|---|---|
| Vermelho | Férias vencidas ou +24 meses sem promoção | Agir esta semana |
| Âmbar | Férias vencendo em 30 dias ou +18 meses sem promoção | Planejar ação em breve |
| Azul | Férias vencendo em 90 dias | Monitorar e planejar cobertura |

Clique no nome de qualquer colaborador para ir direto à ficha dele.

---

### 3.7 Próximas férias agendadas

Lista os colaboradores com férias já aprovadas e com data definida, em ordem cronológica. Use para planejar a cobertura da equipe nos próximos meses. Clique em "Ver tudo →" para abrir a Agenda de Férias completa.

---

### 3.8 Aniversários de empresa

Mostra quem completa anos de empresa nos próximos 30 dias. Use para reconhecimento e engajamento. Clique no nome para abrir a ficha do colaborador.

---

### 3.9 Ações rápidas

Quatro botões no canto inferior direito para as ações mais frequentes:
- **+ Novo colaborador** — abre o formulário de cadastro
- **Agendar férias** — vai para a Agenda de Férias
- **Editar grelha salarial** — vai para a Grelha Salarial
- **Ver todos os colaboradores** — vai para a lista completa

---

## 4. Colaboradores — a tela central

A tela de Colaboradores lista toda a equipe e é de onde você acessa o cadastro de cada pessoa, aplica filtros e exporta dados.

### 4.1 O que aparece na tabela

Cada linha mostra:

| Coluna | O que é |
|---|---|
| **Colaborador** | Nome completo, e-mail e avatar com iniciais |
| **Cargo** | Badge colorido com cargo macro e nível (ex.: "Pleno 2") |
| **Equipe** | Área ou time do colaborador |
| **Tempo** | Tempo de empresa calculado automaticamente (ex.: "3a 4m") |
| **Salário** | Salário atual formatado |
| **S/ promoção** | Meses desde a última promoção — vermelho se +24m, âmbar se +18m |
| **Status** | Dropdown para alterar o status diretamente na lista |
| **Ver →** | Aparece ao passar o mouse — abre a ficha do colaborador |

---

### 4.2 Busca

O campo de busca no topo da lista **pesquisa em quatro campos ao mesmo tempo**: nome, e-mail, equipe e gestor. Basta começar a digitar — a lista se atualiza automaticamente após uma pausa de meio segundo.

Exemplos:
- Digitar `"João"` mostra todos os colaboradores chamados João
- Digitar `"Produto"` mostra colaboradores da equipe Produtos, mas também gestores com "Produto" no nome
- Digitar `"joao@adaptive"` encontra pelo e-mail

---

### 4.3 Filtros básicos

Sempre visíveis abaixo da barra de busca:

- **Cargo:** Júnior / Pleno / Sênior
- **Status:** Ativo / Férias / Afastado / Desligado

---

### 4.4 Filtros avançados

Clique no botão **"Filtros"** (ícone de ajustes) para expandir os filtros adicionais:

- **Nível:** N1, N2, N3 ou N4 — filtra dentro de um cargo (ex.: só Pleno N2)
- **Equipe:** lista exata das equipes cadastradas no sistema
- **Sem promoção há mais de:** opções de 6, 12, 18 ou 24 meses
- **Faixa salarial:** quatro faixas predefinidas para segmentar por remuneração

**Chips de filtros ativos:** cada filtro aplicado aparece como um chip azul logo abaixo dos filtros. Clique no **X** de qualquer chip para remover apenas aquele filtro sem afetar os demais. O botão **"Limpar"** remove tudo de uma vez.

---

### 4.5 Alterar o status sem abrir a ficha

Na coluna Status, clique no badge colorido de qualquer colaborador e selecione o novo status no dropdown. A alteração é salva imediatamente, sem precisar abrir a ficha ou confirmar.

| Status | Quando usar |
|---|---|
| **Ativo** | Colaborador trabalhando normalmente |
| **Férias** | Colaborador em gozo de férias |
| **Afastado** | Licença médica, licença-maternidade, licença-paternidade etc. |
| **Desligado** | Colaborador que saiu da empresa |

> Colaboradores desligados não aparecem nos cards do Dashboard, nos alertas nem nas férias. Eles ficam no banco de dados e podem ser localizados filtrando por "Desligado" na lista.

---

## 5. Cadastrar um novo colaborador

### 5.1 Onde encontrar

Na tela de Colaboradores, clique em **"+ Novo"** no canto superior direito.

### 5.2 Preenchendo o formulário

O formulário está dividido em blocos lógicos:

**Dados pessoais e profissionais**

| Campo | Obrigatório | Dica |
|---|:---:|---|
| Nome completo | Sim | Como aparece em todos os relatórios |
| E-mail corporativo | Sim | Único por colaborador |
| Equipe / Área | Sim | Use sempre o mesmo formato (ex.: "Suporte ao Cliente", não "suporte" ou "SAC") |
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
| Salário atual | Sim | Valor bruto mensal |
| Data do último reajuste | Não | Se o colaborador já tiver histórico anterior |
| Data da última promoção | Não | Se o colaborador já tiver histórico anterior |

**Previsões de carreira (opcional)**

- **Próximo nível previsto:** ex.: `pleno-3` — serve para o planejamento de carreira
- **Data prevista para promoção:** gera um alerta quando a data se aproximar

**Observações:** campo livre para anotações internas sobre o colaborador. Não é visível para o colaborador.

### 5.3 Finalizando o cadastro

Clique em **"Cadastrar colaborador"**. O sistema redireciona para a ficha do novo colaborador.

> **Próximo passo importante:** se o colaborador já completou 12 meses de empresa, registre o período aquisitivo de férias. Acesse a Agenda de Férias, clique em **"+ Novo período"** e vincule ao colaborador.

---

## 6. Ficha do colaborador

A ficha é a tela de detalhes de cada pessoa. Para acessá-la, clique no nome do colaborador ou no botão **"Ver →"** que aparece ao passar o mouse.

### 6.1 Alertas no topo

Se houver alguma situação urgente, um banner colorido aparece no topo da ficha:

- **Vermelho:** "Férias vencidas há N dias. Agendar imediatamente."
- **Âmbar:** "Férias vencem em N dias. Considere agendar." (quando faltam menos de 60 dias)
- **Âmbar:** "N meses sem promoção. Colaborador pode estar elegível para revisão." (a partir de 18 meses)

### 6.2 Cabeçalho

Mostra nome, cargo completo (ex.: "Analista Pleno N2"), badge de cargo, badge de nível e badge de status. Os botões **"Editar"** e **"Excluir"** ficam no canto superior direito.

### 6.3 Informações principais

Card com os dados cadastrais do colaborador:
- E-mail, equipe, gestor
- Data de admissão e tempo de empresa calculado automaticamente
- Salário atual, data do último reajuste e há quanto tempo foi

### 6.4 Controle de férias

Card com o status do período aquisitivo ativo:
- Período aquisitivo (início e fim)
- Data de vencimento
- Dias restantes até o vencimento — ou há quantos dias venceu
- Férias agendadas (início e fim, se houver)

Se não houver período registrado, aparece um link direto para a Agenda de Férias.

### 6.5 Promoção & reajuste

Painel com quatro informações em destaque:
- Data da última promoção
- Quantos meses se passaram desde então
- Próximo nível previsto (se preenchido no cadastro)
- Data prevista para a próxima promoção

Os botões **"+ Registrar promoção"** e **"+ Reajuste salarial"** ficam neste painel.

### 6.6 Histórico de promoções

Timeline com todas as promoções do colaborador na empresa:
- Data da promoção
- Cargo anterior → Cargo novo (ex.: "Analista Júnior N3 → Analista Pleno N1")
- Salário antes e depois, com percentual de aumento em verde
- Observações registradas no momento da promoção

### 6.7 Histórico salarial

Timeline com todos os reajustes de salário:
- Data
- Novo valor
- Motivo registrado (ex.: "Reajuste anual / IPCA", "Mérito", "Equiparação")

### 6.8 Editar dados do colaborador

Clique em **"Editar"** para abrir o formulário de edição. Use para atualizar e-mail, equipe, gestor, observações ou qualquer dado cadastral. Para mudanças de salário e cargo, prefira os modais específicos (reajuste e promoção), pois eles registram o histórico automaticamente.

### 6.9 Excluir colaborador

Clique em **"Excluir"** e confirme na janela que aparece. A exclusão remove o colaborador e todo o histórico associado (promoções, salários, férias) de forma permanente.

> **Recomendação:** prefira alterar o status para **"Desligado"** em vez de excluir. Isso preserva o histórico para consulta futura e mantém o colaborador na base para fins de auditoria e LGPD.

---

## 7. Registrar promoção

Use quando o colaborador mudar de cargo e/ou nível — com ou sem aumento salarial.

**Passo a passo:**

1. Abra a ficha do colaborador
2. No painel "Promoção & reajuste", clique em **"+ Registrar promoção"**
3. O modal abre mostrando a posição atual do colaborador
4. Selecione o **novo cargo macro** (Júnior / Pleno / Sênior) e o **novo nível** (1 / 2 / 3 / 4)
5. O cargo completo é gerado automaticamente
6. Informe o **novo salário** (pode ser igual ao anterior se não houver aumento)
7. Informe a **data da promoção** (use a data real, mesmo que retroativa)
8. Adicione observações, se quiser (ex.: "Resultado do ciclo de avaliação Q1/2026")
9. Clique em **"Registrar"**

O sistema atualiza cargo, nível e salário na ficha, e salva o evento no histórico de promoções com a data e o percentual de aumento calculado automaticamente.

> **Dica:** registre todas as promoções — mesmo as retroativas ou as de ajuste de nomenclatura. Histórico completo é mais útil do que histórico seletivo.

---

## 8. Registrar reajuste salarial

Use quando o colaborador receber aumento de salário **sem mudança de cargo ou nível**.

**Passo a passo:**

1. Abra a ficha do colaborador
2. No painel "Promoção & reajuste", clique em **"+ Reajuste salarial"**
3. O modal mostra o salário atual (somente leitura — para referência)
4. Informe o **novo salário**
5. Informe a **data do reajuste**
6. Informe o **motivo** — seja descritivo, pois fica no histórico

Exemplos de motivo:
- "Reajuste anual IPCA 2026"
- "Reajuste por mérito — avaliação semestral"
- "Equiparação salarial — alinhamento de faixa"
- "Promoção interna com reajuste retroativo"

7. Clique em **"Registrar"**

O salário é atualizado na ficha e o evento é salvo no histórico salarial.

---

## 9. Grelha Salarial

A Grelha Salarial define as **faixas de remuneração para cada cargo e nível** da Adaptive. É a referência oficial para decidir se um salário está adequado e para calibrar promoções e reajustes.

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
- **Colaboradores** — quantas pessoas ocupam essa posição no momento
- **Observações** — campo livre para anotar contexto (ex.: "Revisão anual abr/2026")

### 9.2 Editar uma faixa salarial

1. Acesse **Grelha Salarial** no menu lateral
2. Localize a linha que deseja atualizar
3. Clique em **"Editar"** no final da linha
4. No modal, informe o novo **mínimo** e o novo **máximo**
5. Adicione uma observação (recomendado: data e motivo da revisão)
6. Clique em **"Salvar"**

O sistema valida que o mínimo é maior que zero e que o máximo é maior que o mínimo.

### 9.3 Importante: a grelha não altera salários automaticamente

Atualizar a grelha **não muda** o salário de nenhum colaborador. Ela serve como referência — é você quem decide, caso a caso, se algum colaborador precisa ser reajustado para se enquadrar na nova faixa.

**Fluxo recomendado após revisão anual da grelha:**

```
1. Atualize todas as faixas na Grelha Salarial
2. Vá para Colaboradores
3. Filtre por cargo (Júnior, depois Pleno, depois Sênior)
4. Compare o salário de cada pessoa com a nova faixa
5. Use "Reajuste salarial" nos casos abaixo do novo mínimo
```

### 9.4 Ocupação por nível

Abaixo da tabela principal, há três cards (um por cargo macro) com barras mostrando **quantas pessoas há em cada nível** dentro daquele cargo. Use para identificar onde o time está concentrado e onde há espaço para crescimento.

---

## 10. Agenda de Férias

A Agenda de Férias centraliza o controle de todos os períodos aquisitivos e agendamentos da equipe.

### 10.1 Como funciona o ciclo de férias (CLT)

```
Admissão em 15/01/2024
       ↓
Período aquisitivo: 15/01/2024 → 15/01/2025
       ↓
Período concessivo: 15/01/2025 → 15/01/2026
       ↓
Vencimento: 15/01/2026
```

O colaborador tem 12 meses para gozar as férias depois de completar o período aquisitivo. Se não gozar até o vencimento, as férias vencem e a empresa corre risco de ter que pagar em dobro.

O TeamFlow registra o início do período aquisitivo e **calcula automaticamente** o vencimento.

### 10.2 Os cards de resumo

No topo da tela, cinco cards mostram o estado atual:

| Card | O que significa |
|---|---|
| **Em andamento** | Colaboradores que estão em férias agora |
| **Agendadas** | Com datas definidas para o futuro |
| **Não agendadas** | Têm período aquisitivo vencido ou a vencer, mas sem data marcada |
| **Vencendo em 90d** | Vencem nos próximos 90 dias — atenção necessária |
| **Vencidas** | Já venceram — ação urgente |

### 10.3 Seções da página

A página divide os períodos em grupos:

- **Férias vencidas** (borda vermelha) — ação imediata necessária
- **Vencendo em breve** — colaboradores com vencimento nos próximos 90 dias, agrupados por urgência
- **Em andamento** — quem está de férias agora
- **Agendadas** — agrupadas por mês de início
- **Não agendadas** — têm período mas sem data definida

### 10.4 Registrar um novo período aquisitivo

Quando um colaborador completa 12 meses de empresa, é hora de registrar o período para que o sistema passe a monitorar o vencimento.

1. Clique em **"+ Novo período"** no canto superior direito
2. Selecione o colaborador no dropdown
3. Informe a **data de início do período aquisitivo** — normalmente o "aniversário" de empresa do colaborador (data de admissão + 12 meses, mas pode ser a data de admissão mesmo se for o primeiro período)
4. Clique em **"Registrar"**

O sistema calcula automaticamente:
- Fim do período aquisitivo (1 ano após o início)
- Data de vencimento (2 anos após o início)

### 10.5 Agendar as férias de um colaborador

1. Localize o colaborador na seção "Vencidas", "Vencendo em breve" ou "Não agendadas"
2. Clique em **"Agendar"** na linha do colaborador
3. O modal exibe as informações do período: datas de aquisição, vencimento e dias restantes
4. Informe o **início das férias** e a **data de retorno**
5. Adicione observações (opcional — ex.: "Aprovado em reunião 10/04")
6. Clique em **"Confirmar"**

### 10.6 Reagendar férias

Se as datas precisarem mudar após o agendamento:

1. Localize o colaborador na seção "Agendadas"
2. Clique em **"Reagendar"**
3. Atualize as datas
4. Clique em **"Confirmar"**

### 10.7 Encerrar um período de férias

Quando o colaborador retornar:

1. Localize o colaborador na seção "Em andamento" ou "Agendadas"
2. Clique em **"Reagendar"** (o mesmo botão)
3. No modal, clique em **"Marcar concluída"**

Isso remove o período das pendências e atualiza o status.

### 10.8 O que fazer quando as férias vencem

**Vermelho = risco trabalhista.** Quando aparecer um colaborador na seção "Férias vencidas":

1. Entre em contato com o colaborador e com o RH o mais rápido possível
2. Defina datas para o gozo com caráter de urgência
3. Registre o agendamento usando a função "Agendar"
4. Se houver dúvida sobre como regularizar a situação, consulte o departamento jurídico ou de compliance

> **Atenção:** o TeamFlow registra e alerta, mas não regulariza a situação automaticamente. A ação precisa ser sua.

---

## 11. Configurações de notificação

Acesse **Configurações** no menu lateral para personalizar os alertas automáticos por e-mail.

### 11.1 O que o sistema pode enviar por e-mail

| Tipo de alerta | Configuração | Padrão |
|---|---|---|
| Férias a vencer | Quantos dias antes do vencimento | 90 dias |
| Sem promoção | A partir de quantos meses | 18 meses |
| Aniversários de empresa | Quantos dias antes | 30 dias |

### 11.2 Como alterar as configurações

1. Ajuste os valores desejados nos campos
2. Ligue ou desligue os tipos de e-mail individualmente
3. Verifique a lista de destinatários
4. Clique em **"Salvar configurações"**

### 11.3 Histórico de envios

Abaixo das configurações, há uma tabela com os últimos e-mails disparados pelo sistema. Use para confirmar que as notificações estão sendo enviadas.

> **Nota:** os e-mails automáticos dependem do serviço Resend estar configurado com credenciais válidas. Se não estiverem recebendo e-mails, entre em contato com o responsável técnico.

### 11.4 Quando os e-mails são enviados

Os alertas são enviados automaticamente toda **segunda a sexta-feira às 5h (horário de Brasília)** pelo sistema de cron da Vercel.

---

## 12. Exportar e importar dados

### 12.1 Exportar a lista para Excel

O botão de exportação respeita os filtros que estão ativos no momento — você exporta exatamente o que está vendo na tela.

1. Na tela de Colaboradores, aplique os filtros desejados (ou deixe sem filtros para exportar tudo)
2. Clique em **"↓ Excel"** no canto superior direito, ou **"↓ Exportar Excel"** no rodapé da tabela
3. Um arquivo `.csv` será baixado automaticamente
4. Abra diretamente no Excel ou Google Sheets — o arquivo usa codificação UTF-8 com BOM, que garante que acentos e caracteres especiais apareçam corretamente

O arquivo exportado contém 18 colunas: nome, e-mail, cargo completo, cargo macro, nível, equipe, gestor, status, data de admissão, tempo de empresa, salário atual, data do último reajuste, meses desde o reajuste, data da última promoção, meses desde a promoção, próximo nível previsto, previsão de promoção e observações.

---

### 12.2 Importar colaboradores em massa (CSV)

Use para cadastrar vários colaboradores de uma só vez — ideal para a carga inicial de dados ao implantar o sistema.

**Passo a passo:**

1. Na tela de Colaboradores, clique em **"↑ Importar CSV"**
2. No modal, clique em **"↓ Baixar modelo CSV"** para obter o arquivo de exemplo já com o cabeçalho correto
3. Abra o arquivo no Excel ou Google Sheets e preencha os dados
4. Salve como `.csv`
5. Clique em **"Selecionar arquivo CSV"** e escolha o arquivo
6. O sistema exibe uma pré-visualização com os dados e eventuais erros por linha
7. Se houver erros, corrija o arquivo e carregue novamente
8. Quando a pré-visualização estiver sem erros, clique em **"Importar (N)"**

---

### 12.3 Estrutura do arquivo CSV

O arquivo deve ter as seguintes colunas no cabeçalho (primeira linha):

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
| `notes` | Não | Texto | `Tech lead do squad` |

---

### 12.4 Erros mais comuns ao importar

| Mensagem de erro | Causa provável | Como corrigir |
|---|---|---|
| "Colunas obrigatórias faltando" | Cabeçalho incorreto ou faltando | Baixe o modelo e refaça o arquivo a partir dele |
| "macro_role inválido: 'Junior'" | Valor com maiúscula ou em português | Use exatamente: `junior`, `pleno` ou `senior` |
| "Data de admissão inválida" | Data no formato errado | Use o formato `AAAA-MM-DD` — ex.: `2023-01-15` |
| "Salário inválido" | Vírgula usada como separador decimal | Use ponto: escreva `6500.00`, não `6.500,00` |
| "E-mail inválido" | E-mail sem @ ou malformado | Verifique o e-mail de cada linha afetada |
| "status inválido: 'Ativo'" | Valor em português ou com maiúscula | Use exatamente: `active`, `vacation`, `leave` ou `terminated` |

O sistema valida linha por linha e indica o número de cada linha com problema. Corrija o arquivo e reimporte.

---

## 13. Rotina semanal recomendada

O TeamFlow é mais eficiente quando usado com regularidade. Sugerimos esta rotina:

### Toda segunda-feira (5 minutos)

1. Acesse o Dashboard
2. Veja se aparece o aviso vermelho de "pendências críticas" no topo
3. Abra o sino 🔔 e revise os alertas vermelhos — planeje como resolver na semana
4. Veja os alertas âmbares — agende conversas com os colaboradores em questão

### Quinzenalmente (10 minutos)

1. Vá para Colaboradores
2. Filtre por "Sem promoção há mais de 18 meses"
3. Revise quem pode estar elegível para revisão de cargo ou salário
4. Exporte a lista para levar para reunião de liderança, se necessário

### Todo mês (15 minutos)

1. Acesse a Agenda de Férias
2. Veja o card "Vencendo em 90d"
3. Entre em contato com os colaboradores sem férias agendadas nesse grupo
4. Registre novos períodos aquisitivos de colaboradores que completaram 12 meses

### A cada 6 meses

1. Revise a Grelha Salarial com base em pesquisas de mercado
2. Compare com os salários praticados (visão salarial no Dashboard)
3. Use os filtros por cargo para identificar pessoas fora da faixa
4. Aplique reajustes onde necessário usando a função "Reajuste salarial"

---

## 14. Perguntas frequentes

**Por que um colaborador não aparece nos alertas mesmo estando há muito tempo sem promoção?**
O sistema só monitora colaboradores com status "Ativo", "Férias" ou "Afastado". Colaboradores desligados não geram alertas.

---

**Posso cadastrar dois colaboradores com o mesmo e-mail?**
Não. O e-mail é único por colaborador. Se houver um e-mail duplicado no CSV durante a importação, a linha será rejeitada com erro.

---

**O que acontece se eu editar o salário diretamente pelo formulário de edição, em vez de usar "Reajuste salarial"?**
O salário será atualizado, mas o evento **não será registrado no histórico salarial**. Use sempre a função "Reajuste salarial" ou "Registrar promoção" para manter o histórico completo.

---

**Posso registrar uma promoção com data retroativa?**
Sim. O campo de data é livre — informe a data real da promoção, mesmo que ela tenha acontecido antes de hoje. O histórico ficará correto.

---

**A grelha salarial muda o salário dos colaboradores automaticamente quando eu edito as faixas?**
Não. A grelha é apenas referência. Para ajustar salários, você precisa usar "Reajuste salarial" colaborador a colaborador.

---

**Por que não estou recebendo os e-mails automáticos de alerta?**
Os e-mails dependem do serviço Resend estar configurado com credenciais válidas (RESEND_API_KEY, RESEND_FROM_EMAIL e EMAIL_MANAGER). Entre em contato com o responsável técnico para verificar se essas configurações estão ativas em produção.

---

**Posso ter mais de um usuário com acesso ao sistema?**
Sim. Cada usuário precisa ser criado pelo administrador no painel do Supabase (Authentication → Users → Invite user). Todos os usuários veem os dados de toda a equipe — não há divisão por permissão nesta versão.

---

**O que significa "período aquisitivo" e "período concessivo"?**
Período aquisitivo é o ano em que o colaborador está acumulando o direito às férias (os primeiros 12 meses de trabalho, ou cada ciclo seguinte). Período concessivo são os 12 meses seguintes, durante os quais as férias precisam ser gozadas. Se não forem usadas no período concessivo, vencem.

---

**Posso exportar apenas uma equipe específica?**
Sim. Aplique o filtro de equipe na tela de Colaboradores antes de clicar em "↓ Excel". A exportação respeitará o filtro.

---

*TeamFlow v1.0 · Adaptive · Abril de 2026 · Uso interno — não distribuir*
