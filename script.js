// Importa a base de dados das palavras-chave
import { wordDatabase } from './wordDatabase.js';

const hxClinica = document.getElementById("hxClinica");
const diagnosticsList = document.getElementById("diagnosticsList");
const hxAtual = document.getElementById("hxAtual");
const diagnosticsAtual = document.getElementById("diagnosticsAtual");
const addDiagnosisButton = document.getElementById("addDiagnosis");

// Diagnósticos reconhecidos
let recognizedDiagnostics = new Set();
let recognizedDiagnosticsAtual = new Set();

// Função para analisar o texto
function analyzeText() {
  const text = hxClinica.value.toLowerCase(); // Converte o texto para minúsculas
  recognizedDiagnostics.clear(); // Limpa diagnósticos reconhecidos
  diagnosticsList.innerHTML = ""; // Limpa a lista visual

  // Procura diagnósticos compostos primeiro
  wordDatabase.forEach(({ keywords, diagnosis }) => {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "g"); // Regex para encontrar a palavra exata
      if (regex.test(text)) {
        recognizedDiagnostics.add(diagnosis); // Adiciona o diagnóstico correto
        break;  // Para evitar sobreposição incorreta
      }
    }
  });

  updateDiagnosticsList(); // Atualiza a lista de diagnósticos
}

// Atualiza a lista de diagnósticos
function updateDiagnosticsList() {
  diagnosticsList.innerHTML = ""; // Limpa a lista de diagnósticos

  recognizedDiagnostics.forEach((diagnosis) => {
    const listItem = document.createElement("li");
    listItem.textContent = diagnosis;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remover";
    removeButton.onclick = () => {
      recognizedDiagnostics.delete(diagnosis);
      updateDiagnosticsList();
    };

    listItem.appendChild(removeButton);
    diagnosticsList.appendChild(listItem);
  });
}

// Função para analisar o texto
function analyzeTextAtual() {
  const text = hxAtual.value.toLowerCase();
  recognizedDiagnosticsAtual.clear();
  diagnosticsAtual.innerHTML = "";

  wordDatabase.forEach(({ keywords, diagnosis }) => {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      if (regex.test(text)) {
        recognizedDiagnosticsAtual.add(diagnosis);
        break;
      }
    }
  });

  updateDiagnosticsAtual();
}

// Atualiza a lista de diagnósticos
function updateDiagnosticsAtual() {
  diagnosticsAtual.innerHTML = "";

  recognizedDiagnosticsAtual.forEach((diagnosis) => {
    const listItem = document.createElement("li");
    listItem.textContent = diagnosis;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remover";
    removeButton.onclick = () => {
      recognizedDiagnosticsAtual.delete(diagnosis);
      updateDiagnosticsAtual();
    };

    listItem.appendChild(removeButton);
    diagnosticsAtual.appendChild(listItem);
  });
}


// Adiciona diagnósticos manualmente
addDiagnosisButton.addEventListener("click", () => {
  const availableDiagnoses = wordDatabase.map((item) => item.diagnosis);
  const manualDiagnosis = prompt(
    `Escolha um diagnóstico para adicionar:\n${availableDiagnoses.join("\n")}`
  );

  if (manualDiagnosis && availableDiagnoses.includes(manualDiagnosis)) {
    recognizedDiagnostics.add(manualDiagnosis);
    updateDiagnosticsList();
  } else if (manualDiagnosis) {
    alert("Diagnóstico inválido! Selecione apenas diagnósticos disponíveis.");
  }
});

// Event listener para alterações no texto
hxClinica.addEventListener("input", analyzeText);
hxAtual.addEventListener("input", analyzeTextAtual);


// Carregar e ler o ficheiro Excel
let excelData = [];

// Evento para carregar o ficheiro Excel
document.getElementById('upload-excel').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        excelData = XLSX.utils.sheet_to_json(worksheet);
        if (excelData.length === 0) {
          alert("O ficheiro Excel está vazio ou não contém dados válidos.");
        } 
      } catch (error) {
        console.error("Erro ao carregar o ficheiro Excel:", error);
        alert("Erro ao processar o ficheiro Excel. Por favor, verifique o formato.");
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Por favor, selecione um ficheiro Excel válido.");
  }
});

// Buscar dados pelo número de episódio
document.getElementById('buscar-dados').addEventListener('click', () => {
  const numeroEpisodio = document.getElementById('numero-episodio').value.trim();
  if (!numeroEpisodio) {
    alert("Por favor, introduza um número de episódio.");
    return;
  }

  const registro = excelData.find((item) => 
    item['[Int Movimento].[Nº Episódio].[Nº Episódio].[MEMBER_CAPTION]'] == numeroEpisodio
  );

  if (registro) {
    // Preencher campos do formulário
    preencherCampos(registro);
  } else {
    alert("Número de episódio não encontrado no ficheiro Excel.");
  }
});

// Função para preencher os campos do formulário
function preencherCampos(registro) {
  document.getElementById('processo-paciente').value = registro['[Utente].[Nº Processo].[Nº Processo].[MEMBER_CAPTION]'] || '';
  document.getElementById('sexo-paciente').value = registro['[Utente].[Sexo].[Sexo].[MEMBER_CAPTION]'] || '';
  document.getElementById('nascimento-paciente').value = registro['[Utente].[Data Nascimento].[Data Nascimento].[MEMBER_CAPTION]'] || '';
  document.getElementById('proveniencia').value = registro['[Int Movimento].[Tipo Entrada Responsável].[Tipo Entrada Responsável].[MEMBER_CAPTION]'] || '';
  document.getElementById('servanterior').value = registro['[Int Movimento].[Serviço Responsável Anterior].[Responsável Anterior].[MEMBER_CAPTION]'] || '';
  document.getElementById('data-admissao').value = registro['[Int Movimento].[Data Entrada Serviço].[Data Entrada Serviço].[MEMBER_CAPTION]'] || '';
  document.getElementById('destino').value = registro['[Int Movimento].[Tipo Saída Responsável].[Tipo Saída Responsável].[MEMBER_CAPTION]'] || '';
  document.getElementById('servposterior').value = registro['[Int Movimento].[Serviço Responsável Próximo].[Responsável Próximo].[MEMBER_CAPTION]'] || '';
  document.getElementById('data-alta').value = registro['[Int Movimento].[Data Saída Serviço].[Data Saída Serviço].[MEMBER_CAPTION]'] || '';
  document.getElementById('estado-clinico').value = registro['[Int Movimento].[Resultado Serviço].[Resultado Serviço].[MEMBER_CAPTION]'] || '';
  document.getElementById('data-adm-hosp').value = registro['[Int Admissão HSJ].[Data Admissão HSJ].[Data Admissão HSJ].[MEMBER_CAPTION]'] || '';
  document.getElementById('data-alta-hosp').value = registro['[Int Alta HSJ].[Data Alta].[Data Alta].[MEMBER_CAPTION]'] || '';
  document.getElementById('destinofinal').value = registro['[Destino].[Destino].[Destino].[MEMBER_CAPTION]'] || '';


  // Cálculo da idade
  calcularIdade(registro["[Utente].[Data Nascimento].[Data Nascimento].[MEMBER_CAPTION]"]);


  // Atualizar dias de internamento
  calcularDiasInternamento();
}

// Função para calcular a idade
function calcularIdade(dataNascimento) {
  const idadeSpan = document.getElementById("idade-paciente");
  if (dataNascimento) {
    const nascimento = new Date(dataNascimento);
    if (!isNaN(nascimento)) {
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      idadeSpan.innerText = idade > 0 ? idade : "-";
      return;
    }
  }
  idadeSpan.innerText = "-";
}

// Função para calcular os dias de internamento
function calcularDiasInternamento() {
  const dataAdmissao = document.getElementById("data-admissao").value;
  const dataAlta = document.getElementById("data-alta").value;
  const diasInternamentoSpan = document.getElementById("dias-internamento");

  if (dataAdmissao && dataAlta) {
    const admissao = new Date(dataAdmissao);
    const alta = new Date(dataAlta);

    if (!isNaN(admissao) && !isNaN(alta)) {
      const diffTime = alta - admissao;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      diasInternamentoSpan.innerText = diffDays > 0 ? diffDays : "-";
      return;
    }
  }
  diasInternamentoSpan.innerText = "-";
}

// Atualizar dias de internamento manualmente
document.getElementById("data-admissao").addEventListener("change", calcularDiasInternamento);
document.getElementById("data-alta").addEventListener("change", calcularDiasInternamento);



// Preencher data atual no campo "data-nota"
document.getElementById("data-nota").value = new Date().toISOString().split("T")[0];


// Base de dados - gravar
document.getElementById('gravar').addEventListener('click', () => {
  const newData = collectFormData();

  fetch('http://localhost:3000/gravar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newData)
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
  })
  .catch(error => {
    console.error('Erro ao gravar dados:', error);
    alert('Erro ao gravar os dados.');
  });
});


// Base de dados - exportar

document.getElementById('exportar').addEventListener('click', () => {
  fetch('http://localhost:3000/exportar')
    .then(response => response.json())
    .then(data => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Base de Dados");
      XLSX.writeFile(workbook, "BaseDeDados.xlsx");
    })
    .catch(error => {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar os dados.');
    });
});
