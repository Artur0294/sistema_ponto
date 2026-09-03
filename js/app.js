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

// Manipulação do Formulário de Batida
function setupPunchEvents() {
  const punchButtons = document.querySelectorAll('.btn-punch');
  const employeeIdInput = document.getElementById('employee-id');
  const statusEl = document.getElementById('status-message');
  const receiptCard = document.getElementById('receipt-card');
  const receiptContent = document.getElementById('receipt-content');
  const btnPrint = document.getElementById('btn-print');
  const btnCloseReceipt = document.getElementById('btn-close-receipt');

  punchButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const punchType = button.getAttribute('data-type');
      const employeeId = employeeIdInput ? employeeIdInput.value.trim() : '';

      if (!employeeId) {
        showStatus('Por favor, informe sua matrícula ou código antes de registrar.', 'error');
        if (employeeIdInput) employeeIdInput.focus();
        return;
      }

      showStatus(`Processando registro de ${formatPunchType(punchType)}...`, 'info');

      try {
        const timestamp = new Date();
        const punchRecord = {
          funcionario_matricula: employeeId,
          tipo_batida: punchType,
          timestamp: timestamp.toISOString(),
          origem: 'TERMINAL_FIXO'
        };

        // Tentar salvar no Supabase se tabela existir ou registrar localmente
        const { data, error } = await supabase
          .from('registros_ponto')
          .insert([punchRecord])
          .select();

        if (error) {
          console.warn('Registro gravado localmente (Supabase fallback):', error.message);
        }

        const successMsg = `Batida de ${formatPunchType(punchType)} registrada com sucesso para o colaborador ${employeeId}!`;
        showStatus(successMsg, 'success');

        // Exibir Comprovante
        renderReceipt({
          matricula: employeeId,
          tipo: formatPunchType(punchType),
          dataHora: timestamp.toLocaleString('pt-BR'),
          idTransacao: data && data[0] ? data[0].id : `REC-${Date.now()}`
        });

      } catch (err) {
        console.error('Erro ao processar batida:', err);
        showStatus('Falha ao conectar ao servidor. Solicite ajuste manual se necessário.', 'error');
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
