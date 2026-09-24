import { supabase } from './supabase.js';

// Inicialização e Utilitários de Relógio
function startClock() {
  const clockEl = document.getElementById('clock-display');
  const dateEl = document.getElementById('current-date');

  function update() {
    const now = new Date();

    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('pt-BR');
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('pt-BR', {
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }

  update();
  setInterval(update, 1000);
}

// Inicializar Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// LocalStorage Offline Fallback Helpers
function saveOfflinePunch(punch) {
  const offlinePunches = JSON.parse(localStorage.getItem('offline_registros_ponto') || '[]');
  offlinePunches.push(punch);
  localStorage.setItem('offline_registros_ponto', JSON.stringify(offlinePunches));
}

// Manipulação do Formulário de Batida
function setupPunchEvents() {
  const punchButtons = document.querySelectorAll('.btn-punch');
  const employeeIdInput = document.getElementById('employee-id');
  const btnPrint = document.getElementById('btn-print');
  const btnCloseReceipt = document.getElementById('btn-close-receipt');

  punchButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const punchType = button.getAttribute('data-type');
      const employeeId = employeeIdInput ? employeeIdInput.value.trim() : '';

      if (!employeeId) {
        showStatus('Por favor, informe sua matrícula ou código antes de registrar.', 'error');
        if (employeeIdInput) employeeIdInput.focus();
        return;
      }

      showStatus(`Processando registro de ${formatPunchType(punchType)}...`, 'info');

      const timestamp = new Date();
      const punchRecord = {
        funcionario_id: employeeId,
        funcionario_matricula: employeeId,
        data_hora: timestamp.toISOString(),
        timestamp: timestamp.toISOString(),
        tipo: punchType,
        tipo_batida: punchType,
        origem: 'TERMINAL_FIXO'
      };

      try {
        const { data, error } = await supabase
          .from('registros_ponto')
          .insert([punchRecord])
          .select();

        if (error) {
          console.warn('Salvando no armazenamento local offline:', error.message);
          saveOfflinePunch(punchRecord);
        }

        const successMsg = `Batida de ${formatPunchType(punchType)} registrada com sucesso para o colaborador ${employeeId}!`;
        showStatus(successMsg, 'success');

        renderReceipt({
          matricula: employeeId,
          tipo: formatPunchType(punchType),
          dataHora: timestamp.toLocaleString('pt-BR'),
          idTransacao: data && data[0] ? data[0].id : `REC-${Date.now()}`
        });

      } catch (err) {
        console.warn('Erro na conexão com Supabase, registrando em contingência offline:', err);
        saveOfflinePunch(punchRecord);

        showStatus(`Batida de ${formatPunchType(punchType)} registrada em contingência offline.`, 'success');

        renderReceipt({
          matricula: employeeId,
          tipo: formatPunchType(punchType),
          dataHora: timestamp.toLocaleString('pt-BR'),
          idTransacao: `REC-OFFLINE-${Date.now()}`
        });
      }
    });
  });

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnCloseReceipt) {
    btnCloseReceipt.addEventListener('click', () => {
      const receiptCard = document.getElementById('receipt-card');
      if (receiptCard) receiptCard.classList.add('hidden');
    });
  }
}

function formatPunchType(type) {
  const map = {
    'ENTRADA': 'Entrada',
    'SAIDA_INTERVALO': 'Saída para Intervalo',
    'RETORNO_INTERVALO': 'Retorno do Intervalo',
    'SAIDA_FINAL': 'Saída Final'
  };
  return map[type] || type;
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status-message');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `status-msg ${type}`;
  statusEl.classList.remove('hidden');

  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 5000);
  }
}

function renderReceipt(data) {
  const receiptCard = document.getElementById('receipt-card');
  const receiptContent = document.getElementById('receipt-content');
  if (!receiptCard || !receiptContent) return;

  receiptContent.innerHTML = `
    <p><strong>SISTEMA DE CONTROLE DE PONTO ELETRÔNICO</strong></p>
    <p>-------------------------------------------</p>
    <p><strong>Matrícula Colaborador:</strong> ${data.matricula}</p>
    <p><strong>Tipo de Marcação:</strong> ${data.tipo}</p>
    <p><strong>Data e Hora:</strong> ${data.dataHora}</p>
    <p><strong>ID Comprovante:</strong> ${data.idTransacao}</p>
    <p>-------------------------------------------</p>
    <small>Comprovante gerado via Terminal Fixo de Parede</small>
  `;

  receiptCard.classList.remove('hidden');
  initIcons();
}

// DOMContentLoaded Initialization
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  initIcons();
  setupPunchEvents();
});
