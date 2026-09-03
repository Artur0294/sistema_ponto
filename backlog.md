# 📋 Backlog de Desenvolvimento - Sistema de Controle de Ponto Eletrônico e Gestão de Banco de Horas

Este documento contém o planejamento granular de tarefas e sub-tarefas para o desenvolvimento do sistema, com acompanhamento continuo de status e histórico de alterações.

---

## 📌 Status General das Tarefas

- `[ ]` Pendente
- `[⏳]` Em Progresso
- `[x]` Concluído

---

## 🏗️ 1. Módulo Supabase & Conexão Base
- [x] **1.1. Configuração do Cliente Supabase** *(Data de Conclusão: 2025-05-18)*
  - [x] Criar diretório `js/`
  - [x] Criar `js/supabase.js` importando SDK via CDN ESM (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm`)
  - [x] Exportar instância do Supabase client pronta para configuração de `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- [ ] **1.2. Definição do Schema e tabelas do Banco de Dados PostgreSQL**
  - [ ] Tabela de Usuários/Colaboradores (Matrícula, Nome, Cargo, Status, Saldo Banco de Horas, etc.)
  - [ ] Tabela de Batidas de Ponto (ID Colaborador, Timestamp, Tipo [Entrada, Saída Intervalo, Retorno Intervalo, Saída Final], Origem)
  - [ ] Tabela de Solicitacões / Ajustes Manuais
  - [ ] Tabela de Audit Trail (Logs de Auditoria Imutáveis)
- [ ] **1.3. Políticas RLS (Row Level Security)**

---

## 🧮 2. Módulo de Cálculos e Regras de Negócio (`js/calc.js`)
- [ ] **2.1. Regra de Tolerância de Batida**
  - [ ] Implementar margem de tolerância de 15 min na entrada e 15 min na saída
  - [ ] Implementar cálculo de abatimento debitando apenas os minutos excedentes a 15 min
- [ ] **2.2. Controle de Intervalo Diário**
  - [ ] Validação de 4 batidas por jornada diária
  - [ ] Validação de tempo mínimo de intervalo (1 hora) e alerta em caso de retorno antecipado
- [ ] **2.3. Gestão de Banco de Horas & Alerta Crítico**
  - [ ] Cálculo de saldo acumulado (compensação 1:1)
  - [ ] Verificação e atualização automática para status `ALERTA_JUSTA_CAUSA` caso saldo <= -20.00h
  - [ ] Disparo de alertas/notificações para Gestor e RH
- [ ] **2.4. Tratamento de Dias Fechados & Horas Extras Especiais**
  - [ ] Identificação de batidas em domingos, feriados ou dias não úteis
  - [ ] Marcação como Hora Extra Especial pendente de aprovação do gestor

---

## 📱 3. Módulo Terminal de Parede (`index.html` & `js/app.js`)
- [ ] **3.1. Layout & Interface do Terminal**
  - [ ] Integração com `Pico.css` e `Lucide Icons` (sem emojis)
  - [ ] Display de relógio em tempo real e identificação do colaborador
  - [ ] Painel de registro rápido de ponto (4 batidas)
- [ ] **3.2. Integração com APIs do Navegador**
  - [ ] Emissão e visualização do comprovante de ponto
  - [ ] Suporte a Impressão CSS `@media print` via `window.print()`
  - [ ] Suporte opcional a câmera via `MediaDevices API`
- [ ] **3.3. Contingência & Solicitação de Ajuste**
  - [ ] Redirecionamento para solicitação de ajuste em caso de falha de identificação

---

## 🛡️ 4. Painel do Gestor / Admin (`admin.html`)
- [ ] **4.1. Dashboard de Gestão**
  - [ ] Visão geral de pontos registrados do dia
  - [ ] Alertas visuais para colaboradores com retorno antecipado ou em `ALERTA_JUSTA_CAUSA`
- [ ] **4.2. Gestão de Ajustes Manuais & Horas Extras Especiais**
  - [ ] Painel para aprovação/rejeição de Ajustes Manuais solicitados
  - [ ] Aprovação de Horas Extras Especiais (finais de semana/feriados)
- [ ] **4.3. Audit Trail / Log de Auditoria Imutável**
  - [ ] Interface para visualização de logs imutáveis de alterações
  - [ ] Registro completo: Motivo, Horário Novo, Nome, Cargo, ID Responsável, IP/Data/Hora, Histórico Comparativo

---

## 👤 5. Portal do Colaborador (`portal.html`)
- [ ] **5.1. Consulta de Espelho de Ponto**
  - [ ] Visualização das batidas registradas por período/mês
  - [ ] Extrato do saldo do Banco de Horas
- [ ] **5.2. Solicitação de Ajuste / Justificativa**
  - [ ] Formulário para envio de pedido de ajuste manual ao Superior Direto com justificativa e anexo/motivo

---

## 🎨 6. Estilização, Acessibilidade & Testes (`css/custom.css`)
- [ ] **6.1. Design System & CSS Customizado**
  - [ ] Fundo claro (`light mode`) minimalista
  - [ ] Estilização para visualização em Tablets (paisagem/retrato) e Desktops
  - [ ] Estilos de impressão `@media print`
- [ ] **6.2. Testes de Integração e Regras de Negócio**
  - [ ] Testes unitários do algoritmo em `js/calc.js`
  - [ ] Verificação E2E dos fluxos de registro e auditoria

---

## 📜 Histórico de Alterações

| Data | Responsável | Descrição da Alteração |
| :--- | :--- | :--- |
| 2025-05-18 | Jules (AI) | Criação inicial do `backlog.md` estruturado com base na SPEC técnica. |
