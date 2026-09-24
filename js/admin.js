import { supabase } from './supabase.js';

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getOfflineAdjustments() {
  return JSON.parse(localStorage.getItem('offline_solicitacoes_ajuste') || '[]');
}

async function loadDashboardMetrics() {
  console.log('--- Iniciando carregamento do Painel Admin ---');

  try {
    // 1. Total Funcionários & Alertas
    let funcData = [];
    const { data: fData, error: fErr } = await supabase.from('funcionarios').select('*');
    console.log('Resposta Supabase [funcionarios]:', { data: fData, error: fErr });

    if (fErr) {
      console.warn('Erro RLS/Permissão em [funcionarios]:', fErr.message);
    } else if (fData) {
      funcData = fData;
    }

    document.getElementById('metric-total-func').textContent = funcData.length;

    const criticals = funcData.filter(f => f.status === 'ALERTA_JUSTA_CAUSA' || (f.saldo_banco_horas_minutos && f.saldo_banco_horas_minutos <= -1200));
    document.getElementById('metric-alertas-criticos').textContent = criticals.length;

    renderCriticalEmployees(criticals);

    // 2. Registros de ponto hoje
    let pontoCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: pontoData, error: pontoErr } = await supabase
      .from('registros_ponto')
      .select('id, data_hora')
      .gte('data_hora', `${todayStr}T00:00:00`);

    console.log('Resposta Supabase [registros_ponto]:', { data: pontoData, error: pontoErr });

    if (!pontoErr && pontoData) {
      pontoCount = pontoData.length;
    }

    const offlinePunches = JSON.parse(localStorage.getItem('offline_registros_ponto') || '[]');
    document.getElementById('metric-ponto-hoje').textContent = pontoCount + offlinePunches.length;

    // 3. Ajustes Pendentes (Online + Offline)
    let onlineAdjustments = [];
    const { data: ajData, error: ajErr } = await supabase
      .from('solicitacoes_ajuste')
      .select('*')
      .eq('status', 'PENDENTE');

    console.log('Resposta Supabase [solicitacoes_ajuste]:', { data: ajData, error: ajErr });

    if (ajErr) {
      console.warn('Erro ao buscar [solicitacoes_ajuste]:', ajErr.message);
    } else if (ajData) {
      onlineAdjustments = ajData;
    }

    const offlineAdjustments = getOfflineAdjustments().filter(a => a.status === 'PENDENTE');
    const allAdjustments = [...offlineAdjustments, ...onlineAdjustments];

    document.getElementById('metric-ajustes-pendentes').textContent = allAdjustments.length;
    renderAdjustmentsTable(allAdjustments, ajErr);

    // 4. Trilha de Auditoria
    let auditData = [];
    const { data: logs, error: logsErr } = await supabase
      .from('logs_auditoria')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('Resposta Supabase [logs_auditoria]:', { data: logs, error: logsErr });

    if (!logsErr && logs) {
      auditData = logs;
    }

    const offlineLogs = JSON.parse(localStorage.getItem('offline_logs_auditoria') || '[]');
    renderAuditLogsTable([...offlineLogs, ...auditData], logsErr);

  } catch (err) {
    console.error('Erro crítico ao carregar dados do painel do gestor:', err);
  }
}

function renderCriticalEmployees(employees) {
  const container = document.getElementById('critical-employees-list');
  if (!container) return;

  if (!employees || employees.length === 0) {
    container.innerHTML = '<p class="text-muted"><i data-lucide="check-circle" class="icon-inline"></i> Nenhum colaborador com saldo em alerta crítico no momento.</p>';
    initIcons();
    return;
  }

  let html = '<ul class="critical-list">';
  employees.forEach(emp => {
    const saldoHoras = emp.saldo_banco_horas_minutos ? (emp.saldo_banco_horas_minutos / 60).toFixed(2) : '-20.00';
    html += `
      <li style="color: #c92a2a; font-weight: bold; margin-bottom: 0.5rem;">
        <i data-lucide="alert-octagon" class="icon-inline"></i>
        Matrícula: ${emp.matricula || emp.id} - ${emp.nome || 'Colaborador'} (${emp.cargo || 'Funcionário'}) | Status: ${emp.status} | Saldo: ${saldoHoras}h
      </li>
    `;
  });
  html += '</ul>';
  container.innerHTML = html;
  initIcons();
}

function renderAdjustmentsTable(requests, error) {
  const tbody = document.getElementById('adjustments-table-body');
  if (!tbody) return;

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="color:#d9534f;"><i data-lucide="alert-circle" class="icon-inline"></i> Erro ao consultar Supabase (${error.message || 'Erro RLS/Permissão'}). Exibindo contingência local se houver.</td></tr>`;
    initIcons();
  }

  if (!requests || requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhuma solicitação de ajuste pendente encontrada no banco de dados.</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(req => `
    <tr>
      <td>${req.id}</td>
      <td>${req.funcionario_id || req.funcionario_matricula || 'N/A'}</td>
      <td>${req.data_hora_sugerida ? new Date(req.data_hora_sugerida).toLocaleString('pt-BR') : 'N/A'}</td>
      <td>${req.tipo || req.tipo_batida || 'N/A'}</td>
      <td>${req.motivo || 'Sem justificativa'}</td>
      <td><mark class="secondary">${req.status}</mark></td>
      <td>
        <button class="btn-approve" data-id="${req.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Aprovar</button>
        <button class="btn-reject secondary" data-id="${req.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-left: 0.25rem;">Rejeitar</button>
      </td>
    </tr>
  `).join('');

  setupActionButtons();
}

function setupActionButtons() {
  document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', () => handleAdjustmentAction(btn.getAttribute('data-id'), 'APROVADO'));
  });

  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => handleAdjustmentAction(btn.getAttribute('data-id'), 'REJEITADO'));
  });
}

async function handleAdjustmentAction(id, newStatus) {
  try {
    const offlineList = getOfflineAdjustments();
    const foundIndex = offlineList.findIndex(a => a.id === id);

    if (foundIndex !== -1) {
      offlineList[foundIndex].status = newStatus;
      localStorage.setItem('offline_solicitacoes_ajuste', JSON.stringify(offlineList));
    } else {
      const { error } = await supabase
        .from('solicitacoes_ajuste')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) console.warn('Erro ao atualizar Supabase:', error.message);
    }

    const auditLog = {
      id: `LOG-${Date.now()}`,
      acao: `AJUSTE_${newStatus}`,
      responsavel: 'GESTOR_RH',
      motivo: `Solicitação #${id} alterada para ${newStatus}`,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('logs_auditoria').insert([auditLog]);
    } catch (e) {
      const offlineLogs = JSON.parse(localStorage.getItem('offline_logs_auditoria') || '[]');
      offlineLogs.push(auditLog);
      localStorage.setItem('offline_logs_auditoria', JSON.stringify(offlineLogs));
    }

    alert(`Solicitação #${id} foi ${newStatus.toLowerCase()} com sucesso!`);
    loadDashboardMetrics();

  } catch (err) {
    console.error('Erro ao processar ação de ajuste:', err);
  }
}

function renderAuditLogsTable(logs, error) {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum registro de auditoria gravado no momento.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>${new Date(log.created_at || Date.now()).toLocaleString('pt-BR')}</td>
      <td><strong>${log.acao || 'AJUSTE_MANUAL'}</strong></td>
      <td>${log.responsavel || 'GESTOR'}</td>
      <td>${log.colaborador_afetado || 'N/A'}</td>
      <td>${log.motivo || log.historico_comparativo || '-'}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  loadDashboardMetrics();
});
