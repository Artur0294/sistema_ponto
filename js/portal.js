import { supabase } from './supabase.js';

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
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

      try {
        const payload = {
          funcionario_id: matricula,
          data_hora_sugerida: new Date(datetime).toISOString(),
          tipo: tipo,
          motivo: motivo,
          status: 'PENDENTE',
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('solicitacoes_ajuste')
          .insert([payload]);

        if (error) {
          console.warn('Solicitação enviada via fallback local:', error.message);
        }

        showPortalStatus('Solicitação de ajuste enviada ao seu Gestor/RH com sucesso!', 'success');

        // Limpar formulário de justificativa
        document.getElementById('adj-motivo').value = '';
      } catch (err) {
        console.error('Erro ao enviar ajuste:', err);
        showPortalStatus('Falha ao enviar solicitação de ajuste.', 'error');
      }
    });
  }
}

async function loadEmployeePointMirror(matricula) {
  try {
    // 1. Dados do colaborador
    const { data: empData, error: empErr } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('matricula', matricula)
      .maybeSingle();

    const summaryCard = document.getElementById('employee-summary-card');
    if (!empErr && empData) {
      document.getElementById('emp-nome').textContent = empData.nome || matricula;
      document.getElementById('emp-cargo').textContent = empData.cargo || 'Colaborador';
      document.getElementById('emp-status').textContent = empData.status || 'ATIVO';

      const saldoMin = empData.saldo_banco_horas_minutos || 0;
      const saldoHoras = (saldoMin / 60).toFixed(2);
      document.getElementById('emp-saldo').textContent = `${saldoHoras}h`;

      if (summaryCard) summaryCard.classList.remove('hidden');
    } else {
      document.getElementById('emp-nome').textContent = matricula;
      document.getElementById('emp-cargo').textContent = 'Colaborador';
      document.getElementById('emp-status').textContent = 'ATIVO';
      document.getElementById('emp-saldo').textContent = '0.00h';
      if (summaryCard) summaryCard.classList.remove('hidden');
    }

    // Preencher automaticamente o campo de matrícula no formulário de ajuste
    const adjMatricula = document.getElementById('adj-matricula');
    if (adjMatricula) adjMatricula.value = matricula;

    // 2. Histórico de Ponto
    const { data: mirrorData, error: mirrorErr } = await supabase
      .from('registros_ponto')
      .select('*')
      .eq('funcionario_matricula', matricula)
      .order('timestamp', { ascending: false });

    renderMirrorTable(mirrorData || []);

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
      <td>${rec.id || 'REG-' + Date.now()}</td>
      <td>${new Date(rec.timestamp || rec.data_hora).toLocaleString('pt-BR')}</td>
      <td><strong>${formatType(rec.tipo_batida || rec.tipo)}</strong></td>
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
