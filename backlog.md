# 📋 Backlog de Desenvolvimento - Sistema de Controle de Ponto Eletrônico e Gestão de Banco de Horas

Este documento contém a estrutura granular de tarefas e subtarefas para o desenvolvimento do sistema, com acompanhamento contínuo de status e histórico de alterações.

---

## 📌 Status Geral das Tarefas

- `[ ]` Pendente
- `[⏳]` Em Progresso
- `[x]` Concluído

---

## 🏗️ Módulo 1: Conexão e Infraestrutura
- [x] **1.1. Análise de Contexto, SPEC Técnica e Esquema SQL** *(Data de Conclusão: 2025-05-18)*
  - [x] Leitura e validação da especificação técnica (`SPEC.md` / `README.md`)
  - [x] Validação da arquitetura No-Build (HTML5, CSS3 nativo, JS Vanilla ES6+, Supabase via CDN ESM)
- [x] **1.2. Configuração da Conexão Base Supabase (`js/supabase.js`)** *(Data de Conclusão: 2025-05-18)*
  - [x] Criar estrutura `/js`
  - [x] Importar SDK do Supabase via CDN ESM (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm`)
  - [x] Exportar e inicializar instância do cliente Supabase com as chaves públicas informadas
- [x] **1.3. Validação da Conexão Compartilhada & Diagnóstico (`js/admin.js`)** *(Data de Conclusão: 2025-05-18)*
  - [x] Inserir logs de depuração (`console.log`) detalhando respostas (`data`, `error`) do Supabase
  - [x] Tratamento de erros visível e estados vazios nos elementos DOM da interface do Gestor

---

## 💻 Módulo 2: Interface do Terminal de Parede (`index.html`)
- [x] **2.1. Layout & Interface Visual (No-Build + Pico.css + Lucide Icons)** *(Data de Conclusão: 2025-05-18)*
  - [x] Estruturar layout otimizado para Tablets (paisagem/retrato) e Desktops (`index.html` & `css/custom.css`)
  - [x] Integrar Pico.css via CDN
  - [x] Integrar Lucide Icons via CDN (Proibido o uso de Emojis)
  - [x] Relógio digital dinâmico em tempo real e data em `js/app.js`
- [x] **2.2. Fluxo de Registro de Ponto** *(Data de Conclusão: 2025-05-18)*
  - [x] Identificação do colaborador (via Matrícula/PIN)
  - [x] Seleção e confirmação da batida (Entrada, Saída Intervalo, Retorno Intervalo, Saída Final)
  - [x] Validação visual e feedback do registro efetuado
- [x] **2.3. Emissão de Comprovante & Integração Nativas** *(Data de Conclusão: 2025-05-18)*
  - [x] Exibição do comprovante digital de ponto pós-batida
  - [x] Suporte a impressão via `window.print()` e `@media print`
- [ ] **2.4. Contingência**
  - [ ] Redirecionamento/Orientação para Ajuste Manual em caso de falha de identificação

---

## 🧮 Módulo 3: Lógica e Cálculos de Ponto (`js/calc.js`)
- [ ] **3.1. Regras de Tolerância e Abatimento**
  - [ ] Implementar margem de tolerância de 15 minutos na entrada e 15 minutos na saída
  - [ ] Calcular abatimento debitando exclusivamente os minutos que excederem os 15 min (ex: 25 min atraso = 10 min débito)
- [ ] **3.2. Controle de Intervalo (Almoço/Pausa)**
  - [ ] Controle e validação de 4 batidas diárias
  - [ ] Validação do tempo mínimo de descanso (1 hora) e alerta de retorno antecipado para o gestor
- [ ] **3.3. Banco de Horas e Alerta Crítico**
  - [ ] Cálculo de saldo acumulado na proporção 1:1 (extras abatem débitos)
  - [ ] Verificação do limite crítico de -20.00 horas
  - [ ] Alteração de status do colaborador para `ALERTA_JUSTA_CAUSA` e notificação ao Gestor/RH
- [ ] **3.4. Gestão de Dias Fechados e Horas Extras Especiais**
  - [ ] Identificação de batidas em domingos, feriados ou dias não úteis configurados
  - [ ] Marcação de horas como *Hora Extra Especial* pendente de aprovação do gestor

---

## 🛡️ Módulo 4: Painel do Gestor / Admin (`admin.html`)
- [x] **4.1. Visão Geral do Gestor** *(Data de Conclusão: 2025-05-18)*
  - [x] Dashboard com resumo diário de marcações, atrasos e métricas
  - [x] Alertas visuais para colaboradores em `ALERTA_JUSTA_CAUSA` (-20h saldo)
- [x] **4.2. Gestão de Ajustes Manuais & Aprovações** *(Data de Conclusão: 2025-05-18)*
  - [x] Interface para analisar, aprovar ou rejeitar solicitações de ajustes manuais
- [x] **4.3. Audit Trail / Log de Auditoria Imutável** *(Data de Conclusão: 2025-05-18)*
  - [x] Exibição de histórico imutável (`logs_auditoria`) com Ação, Responsável, Afetado e Motivo

---

## 👤 Módulo 5: Portal do Colaborador (`portal.html`)
- [x] **5.1. Consulta de Espelho de Ponto** *(Data de Conclusão: 2025-05-18)*
  - [x] Interface para consulta individual do espelho de ponto por matrícula
  - [x] Extrato resumido do saldo do Banco de Horas e status do colaborador
- [x] **5.2. Solicitação de Ajuste Manual & Justificativa** *(Data de Conclusão: 2025-05-18)*
  - [x] Formulário para o colaborador solicitar ajuste manual informando data, hora, tipo e justificativa

---

## 🔗 Módulo 6: Navegação Geral & Fluxo de Dados End-to-End
- [x] **6.1. Sistema de Navegação Geral** *(Data de Conclusão: 2025-05-18)*
  - [x] Cabeçalho de navegação padronizado e visível em todas as páginas (`index.html`, `admin.html`, `portal.html`)
  - [x] Links direcionados corretamente para os arquivos correspondentes
- [x] **6.2. Teste de Fluxo de Dados entre Telas** *(Data de Conclusão: 2025-05-18)*
  - [x] **Terminal (`index.html`) -> Banco:** Gravação de batida na tabela `registros_ponto`
  - [x] **Banco -> Portal (`portal.html`):** Batida visível no espelho de ponto do colaborador
  - [x] **Portal -> Admin (`admin.html`):** Solicitação de ajuste inserida em `solicitacoes_ajuste` visível para o gestor
  - [x] **Admin -> Banco:** Aprovação de ajuste altera status para `APROVADO`/`REJEITADO` e registra evento em `logs_auditoria`

---

## 📜 Histórico de Alterações

| Data | Responsável | Descrição da Alteração |
| :--- | :--- | :--- |
| 2025-05-18 | Jules (AI) | Criação inicial do `backlog.md` estruturado com base na SPEC técnica. |
| 2025-05-18 | Jules (AI) | Reorganização do `backlog.md` em módulos numerados padrão e conclusão das tarefas 1.1, 1.2 e 2.1. |
| 2025-05-18 | Jules (AI) | Implementação dos módulos Painel do Gestor (`admin.html` / `js/admin.js`) e Portal do Colaborador (`portal.html` / `js/portal.js`), com atualização do backlog. |
| 2025-05-18 | Jules (AI) | Adicionada e validada a seção de Navegação Geral e Teste de Fluxo de Dados End-to-End no `backlog.md`. |
| 2025-05-18 | Jules (AI) | Adicionados logs de depuração e tratamento de erros do Supabase em `js/admin.js`. |
