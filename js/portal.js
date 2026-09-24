import { supabase } from './supabase.js';

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getOfflinePunches(matricula) {
  const allOffline = JSON.parse(localStorage.getItem('offline_registros_ponto') || '[]');
  return allOffline.filter(r => (r.funcionario_id === matricula || r.funcionario_matricula === matricula));
}

function getOfflineAdjustments() {
  return JSON.parse(localStorage.getItem('offline_solicitacoes_ajuste') || '[]');
}

function saveOfflineAdjustment(adj) {
  const adjustments = getOfflineAdjustments();
  adjustments.push(adj);
  localStorage.setItem('offline_solicitacoes_ajuste', JSON.stringify(adjustments));
}

function setupPortalEvents() {
  const btnSearch = document.getElementById('btn-search-ponto');
  const searchMatriculaInput = document.getElementById('search-matricula');
  const btnSubmitAdjustment = document.getElementById('btn-submit-adjustment');

  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      const matricula = searchMatriculaInput ? searchMatriculaInput.value.trim() : '';
      if (!matricula) {
        showPortalStatus('Por favor, informe uma matrícula válida.', 'error');
        return;
      }
      loadEmployeePointMirror(matricula);
    });
  }

  if (btnSubmitAdjustment) {
    btnSubmitAdjustment.addEventListener('click', async () => {
      const matricula = document.getElementById('adj-matricula')?.value.trim();
      const datetime = document.getElementById('adj-datetime')?.value;
      const tipo = document.getElementById('adj-tipo')?.value;
      const motivo = document.getElementById('adj-motivo')?.value.trim();

      if (!matricula || !datetime || !motivo) {
        showPortalStatus('Por favor, preencha todos os campos do formulário de ajuste.', 'error');
        return;
      }

      showPortalStatus('Enviando solicitação de ajuste...', 'info');

      const payload = {
        id: `AJUSTE-OFF-${Date.now()}`,
        funcionario_id: matricula,
        funcionario_matricula: matricula,
        data_hora_sugerida: new Date(datetime).toISOString(),
        tipo: tipo,
        tipo_batida: tipo,
        motivo: motivo,
        status: 'PENDENTE',
        created_at: new Date().toISOString()
      };

      try {
        const { error } = await supabase
          .from('solicitacoes_ajuste')
          .insert([payload]);

        if (error) {
          console.warn('Gravando solicitação em contingência local:', error.message);
          saveOfflineAdjustment(payload);
        }

        showPortalStatus('Solicitação de ajuste enviada ao seu Gestor/RH com sucesso!', 'success');
        document.getElementById('adj-motivo').value = '';

      } catch (err) {
        console.warn('Erro ao conectar ao banco, salvando ajuste localmente:', err);
        saveOfflineAdjustment(payload);

        showPortalStatus('Solicitação de ajuste enviada (armazenada em contingência).', 'success');
        document.getElementById('adj-motivo').value = '';
      }
    });
  }
}

async function loadEmployeePointMirror(matricula) {
  try {
    const summaryCard = document.getElementById('employee-summary-card');

    // 1. Dados do colaborador
    const { data: empData } = await supabase
      .from('funcionarios')
      .select('*')
      .or(`matricula.eq.${matricula},id.eq.${matricula}`)
      .maybeSingle();

    if (empData) {
      document.getElementById('emp-nome').textContent = empData.nome || matricula;
      document.getElementById('emp-cargo').textContent = empData.cargo || 'Colaborador';
      document.getElementById('emp-status').textContent = empData.status || 'ATIVO';

      const saldoMin = empData.saldo_banco_horas_minutos || 0;
      const saldoHoras = (saldoMin / 60).toFixed(2);
      document.getElementById('emp-saldo').textContent = `${saldoHoras}h`;
    } else {
      document.getElementById('emp-nome').textContent = matricula;
      document.getElementById('emp-cargo').textContent = 'Colaborador';
      document.getElementById('emp-status').textContent = 'ATIVO';
      document.getElementById('emp-saldo').textContent = '0.00h';
    }

    if (summaryCard) summaryCard.classList.remove('hidden');

    const adjMatricula = document.getElementById('adj-matricula');
    if (adjMatricula) adjMatricula.value = matricula;

    // 2. Histórico de Ponto (Supabase + LocalStorage)
    let onlineRecords = [];
    try {
      const { data: mirrorData } = await supabase
        .from('registros_ponto')
        .select('*')
        .or(`funcionario_id.eq.${matricula},funcionario_matricula.eq.${matricula}`)
        .order('data_hora', { ascending: false });

      if (mirrorData) onlineRecords = mirrorData;
    } catch (e) {
      console.warn('Falha na consulta online do espelho:', e);
    }

    const offlineRecords = getOfflinePunches(matricula);
    const combined = [...offlineRecords, ...onlineRecords];

    renderMirrorTable(combined);

  } catch (err) {
    console.error('Erro ao carregar espelho de ponto:', err);
    showPortalStatus('Erro ao carregar espelho de ponto.', 'error');
  }
}

function renderMirrorTable(records) {
  const tbody = document.getElementById('mirror-table-body');
  if (!tbody) return;

  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum registro de ponto encontrado para esta matrícula.</td></tr>';
    return;
  }

  tbody.innerHTML = records.map(rec => `
    <tr>
      <td>${rec.id || 'REG-LOCAL'}</td>
      <td>${new Date(rec.data_hora || rec.timestamp).toLocaleString('pt-BR')}</td>
      <td><strong>${formatType(rec.tipo || rec.tipo_batida)}</strong></td>
      <td>${rec.origem || 'TERMINAL'}</td>
    </tr>
  `).join('');
}

function formatType(type) {
  const map = {
    'ENTRADA': 'Entrada',
    'SAIDA_INTERVALO': 'Saída Intervalo',
    'RETORNO_INTERVALO': 'Retorno Intervalo',
    'SAIDA_FINAL': 'Saída Final'
  };
  return map[type] || type || 'Batida';
}

function showPortalStatus(msg, type) {
  const statusEl = document.getElementById('portal-status-msg');
  if (!statusEl) return;

  statusEl.textContent = msg;
  statusEl.className = `status-msg ${type}`;
  statusEl.classList.remove('hidden');

  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  setupPortalEvents();
});
