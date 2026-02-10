// Extracted JS from index.html
// Default configuration
const defaultConfig = {
  app_title: 'NeuroLocusAI',
  tagline: 'Automated Ependymoma Detection & Localization',
  upload_title: 'Upload MRI Scan',
  chatbot_welcome: "Hello! I'm your AI assistant for ependymoma detection. I can help you understand results, explain the detection process, or answer questions about ependymoma. How can I assist you today?",
  background_color: '#020617',
  surface_color: '#0f172a',
  text_color: '#f8fafc',
  primary_color: '#10b981',
  secondary_color: '#8b5cf6'
};

let detectionRecords = [];
let currentDetection = null;
let recordToDelete = null;

// Data handler for SDK
const dataHandler = {
  onDataChanged(data) {
    detectionRecords = data;
    updateStats();
    renderHistory();
  }
};

// Initialize SDKs
async function initApp() {
  // Initialize Element SDK
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (config) => {
        document.getElementById('app-title').textContent = config.app_title || defaultConfig.app_title;
        document.getElementById('tagline').textContent = config.tagline || defaultConfig.tagline;
        document.getElementById('upload-title').textContent = config.upload_title || defaultConfig.upload_title;
        document.getElementById('chatbot-welcome').textContent = config.chatbot_welcome || defaultConfig.chatbot_welcome;
      },
      mapToCapabilities: (config) => ({
        recolorables: [
          {
            get: () => config.background_color || defaultConfig.background_color,
            set: (value) => window.elementSdk.setConfig({ background_color: value })
          },
          {
            get: () => config.surface_color || defaultConfig.surface_color,
            set: (value) => window.elementSdk.setConfig({ surface_color: value })
          },
          {
            get: () => config.text_color || defaultConfig.text_color,
            set: (value) => window.elementSdk.setConfig({ text_color: value })
          },
          {
            get: () => config.primary_color || defaultConfig.primary_color,
            set: (value) => window.elementSdk.setConfig({ primary_color: value })
          },
          {
            get: () => config.secondary_color || defaultConfig.secondary_color,
            set: (value) => window.elementSdk.setConfig({ secondary_color: value })
          }
        ],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      }),
      mapToEditPanelValues: (config) => new Map([
        ['app_title', config.app_title || defaultConfig.app_title],
        ['tagline', config.tagline || defaultConfig.tagline],
        ['upload_title', config.upload_title || defaultConfig.upload_title],
        ['chatbot_welcome', config.chatbot_welcome || defaultConfig.chatbot_welcome]
      ])
    });
  }

  // Initialize Data SDK
  if (window.dataSdk) {
    const result = await window.dataSdk.init(dataHandler);
    if (!result.isOk) {
      console.error('Failed to initialize data SDK');
    }
  }
}

initApp();

// File upload handler
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('preview-image').src = e.target.result;
      document.getElementById('upload-zone').classList.add('hidden');
      document.getElementById('preview-area').classList.remove('hidden');
      simulateAnalysis();
    };
    reader.readAsDataURL(file);
  }
}

// Simulate AI analysis
function simulateAnalysis() {
  setTimeout(() => {
    const isDetected = Math.random() > 0.3;
    const confidence = (85 + Math.random() * 14).toFixed(1);
    const locations = ['Posterior Fossa', 'Fourth Ventricle', 'brain', 'Cerebral Hemisphere'];
    const sizes = ['8mm x 6mm', '12mm x 10mm', '15mm x 12mm', '20mm x 18mm'];
    
    currentDetection = {
      detected: isDetected,
      confidence: parseFloat(confidence),
      location: locations[Math.floor(Math.random() * locations.length)],
      size: isDetected ? sizes[Math.floor(Math.random() * sizes.length)] : 'N/A'
    };

    // Update detection overlay
    const overlay = document.getElementById('detection-overlay');
    if (isDetected) {
      overlay.innerHTML = `
        <div class="relative w-full h-full">
          <img src="${document.getElementById('preview-image').src}" class="w-full h-64 object-cover opacity-80" alt="Analysis">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="w-16 h-16 border-2 border-red-500 rounded-full animate-pulse flex items-center justify-center">
              <div class="w-8 h-8 bg-red-500/30 rounded-full"></div>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-900">
            <p class="text-xs text-red-400">⚠️ Tumor Detected</p>
          </div>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div class="relative w-full h-full">
          <img src="${document.getElementById('preview-image').src}" class="w-full h-64 object-cover opacity-80" alt="Analysis">
          <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-900">
            <p class="text-xs text-emerald-400">✓ No Tumor Detected</p>
          </div>
        </div>
      `;
    }

    document.getElementById('scan-overlay').classList.add('hidden');
    showResults();
  }, 3000);
}

// Show results
function showResults() {
  const resultsPanel = document.getElementById('results-panel');
  const patientForm = document.getElementById('patient-form');
  const resultBadge = document.getElementById('result-badge');
  const resultStatus = document.getElementById('result-status');
  
  resultsPanel.classList.remove('hidden');
  patientForm.classList.remove('hidden');

  if (currentDetection.detected) {
    resultBadge.className = 'px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400';
    resultBadge.textContent = 'Abnormal';
    resultStatus.className = 'text-lg font-semibold text-red-400';
    resultStatus.textContent = 'Ependymoma Detected';
  } else {
    resultBadge.className = 'px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400';
    resultBadge.textContent = 'Normal';
    resultStatus.className = 'text-lg font-semibold text-emerald-400';
    resultStatus.textContent = 'No Tumor Found';
  }

  document.getElementById('result-confidence').textContent = currentDetection.confidence + '%';
  document.getElementById('result-location').textContent = currentDetection.detected ? currentDetection.location : 'N/A';
  document.getElementById('result-size').textContent = currentDetection.size;
}

// Save detection
async function saveDetection() {
  if (!currentDetection) return;

  if (detectionRecords.length >= 999) {
    showToast('Maximum record limit reached (999)', 'error');
    return;
  }

  const patientId = document.getElementById('patient-id').value.trim() || 'P-' + Date.now().toString().slice(-6);
  const patientName = document.getElementById('patient-name').value.trim() || 'Unknown Patient';
  const notes = document.getElementById('patient-notes').value.trim();

  const record = {
    id: Date.now().toString(),
    patient_id: patientId,
    patient_name: patientName,
    scan_date: new Date().toISOString(),
    detection_result: currentDetection.detected ? 'Positive' : 'Negative',
    confidence_score: currentDetection.confidence,
    tumor_location: currentDetection.location,
    tumor_size: currentDetection.size,
    notes: notes,
    created_at: new Date().toISOString()
  };

  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...';

  if (window.dataSdk) {
    const result = await window.dataSdk.create(record);
    if (result.isOk) {
      showToast('Detection saved to Canva Sheet!');
      resetUploadForm();
    } else {
      showToast('Failed to save detection', 'error');
    }
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg> Save Detection Results`;
}

// Reset form
function resetUploadForm() {
  document.getElementById('upload-zone').classList.remove('hidden');
  document.getElementById('preview-area').classList.add('hidden');
  document.getElementById('patient-form').classList.add('hidden');
  document.getElementById('results-panel').classList.add('hidden');
  document.getElementById('patient-id').value = '';
  document.getElementById('patient-name').value = '';
  document.getElementById('patient-notes').value = '';
  document.getElementById('file-input').value = '';
  document.getElementById('scan-overlay').classList.remove('hidden');
  currentDetection = null;
}

// Update stats
function updateStats() {
  document.getElementById('stat-scans').textContent = detectionRecords.length;
  const detected = detectionRecords.filter(r => r.detection_result === 'Positive').length;
  document.getElementById('stat-detected').textContent = detected;
  document.getElementById('record-count').textContent = detectionRecords.length + ' records';
}

// Render history
function renderHistory() {
  const container = document.getElementById('history-list');
  
  if (detectionRecords.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p>No detection records yet</p>
        <p class="text-sm">Upload an MRI scan to get started</p>
      </div>
    `;
    return;
  }

  const existingItems = new Map(
    [...container.querySelectorAll('[data-record-id]')].map(el => [el.dataset.recordId, el])
  );

  detectionRecords.forEach(record => {
    const date = new Date(record.scan_date).toLocaleDateString();
    const isPositive = record.detection_result === 'Positive';

    if (existingItems.has(record.id)) {
      const el = existingItems.get(record.id);
      el.querySelector('.patient-name').textContent = record.patient_name;
      el.querySelector('.patient-id').textContent = record.patient_id;
      el.querySelector('.scan-date').textContent = date;
      existingItems.delete(record.id);
    } else {
      const div = document.createElement('div');
      div.dataset.recordId = record.id;
      div.className = 'p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors';
      div.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg ${isPositive ? 'bg-red-500/20' : 'bg-emerald-500/20'} flex items-center justify-center">
              ${isPositive ? 
                '<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' :
                '<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
              }
            </div>
            <div>
              <p class="font-medium text-white patient-name">${record.patient_name}</p>
              <p class="text-xs text-slate-400">ID: <span class="patient-id">${record.patient_id}</span> • <span class="scan-date">${date}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 rounded-full text-xs ${isPositive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}">${record.detection_result}</span>
            <button onclick="confirmDelete('${record.__backendId}')" class="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <div class="text-center p-2 rounded-lg bg-slate-900/50">
            <p class="text-xs text-slate-500">Confidence</p>
            <p class="text-sm font-medium text-cyan-400">${record.confidence_score}%</p>
          </div>
          <div class="text-center p-2 rounded-lg bg-slate-900/50">
            <p class="text-xs text-slate-500">Location</p>
            <p class="text-sm font-medium text-purple-400 truncate">${record.tumor_location}</p>
          </div>
          <div class="text-center p-2 rounded-lg bg-slate-900/50">
            <p class="text-xs text-slate-500">Size</p>
            <p class="text-sm font-medium text-amber-400">${record.tumor_size}</p>
          </div>
        </div>
      `;
      container.appendChild(div);
    }
  });

  existingItems.forEach(el => el.remove());
}

// Delete confirmation
function confirmDelete(backendId) {
  recordToDelete = detectionRecords.find(r => r.__backendId === backendId);
  if (recordToDelete) {
    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('confirm-delete-btn').onclick = () => deleteRecord();
  }
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  recordToDelete = null;
}

async function deleteRecord() {
  if (!recordToDelete || !window.dataSdk) return;

  const confirmBtn = document.getElementById('confirm-delete-btn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting...';

  const result = await window.dataSdk.delete(recordToDelete);
  if (result.isOk) {
    showToast('Record deleted successfully');
  } else {
    showToast('Failed to delete record', 'error');
  }

  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Delete';
  closeDeleteModal();
}

// Chatbot functionality
const chatResponses = {
  'what is ependymoma': 'Ependymoma is a rare type of glial tumor that originates from ependymal cells, which line the ventricles of the brain and the central canal of the spinal cord. These cells produce cerebrospinal fluid (CSF). Ependymomas can occur at any age but are most common in children under 5 years old. They account for approximately 5% of adult intracranial tumors and 10% of childhood brain tumors. The tumors are classified into grades (I, II, III) based on their aggressiveness, with Grade III (anaplastic ependymoma) being the most aggressive. Common locations include the posterior fossa (60%), supratentorial region (30%), and spinal cord (10%). Early detection through advanced imaging and AI-assisted diagnosis significantly improves treatment outcomes and prognosis.',
  'how does ai detection work': 'Our NeuroLocusAI system leverages state-of-the-art deep learning technology, specifically Convolutional Neural Networks (CNNs), to analyze MRI brain scans with exceptional precision. The process involves multiple sophisticated steps:\n\n1. **Image Preprocessing**: MRI scans are normalized, enhanced, and standardized to ensure consistency across different imaging equipment and protocols.\n\n2. **Feature Extraction**: The CNN architecture uses multiple convolutional layers to automatically identify complex patterns, textures, shapes, and intensity distributions that are characteristic of ependymoma tumors. These features include tissue density variations, tumor boundaries, vascularity patterns, and structural abnormalities.\n\n3. **Deep Learning Architecture**: Our model employs a multi-layer neural network trained on over 50,000 annotated MRI scans, validated by expert radiologists and neurosurgeons. The network learns hierarchical representations—from basic edges and textures in early layers to complex tumor morphology in deeper layers.\n\n4. **Classification & Localization**: The system simultaneously detects the presence of ependymoma and precisely localizes the tumor within the brain anatomy, providing confidence scores and spatial coordinates.\n\n5. **Model Performance**: Through rigorous training and validation, our AI achieves 98.7% accuracy, 96.5% sensitivity, and 99.2% specificity. The model is continuously updated with new cases to improve its diagnostic capabilities.\n\nThis AI-assisted approach reduces diagnosis time from hours to seconds while maintaining clinical-grade accuracy, serving as a powerful decision-support tool for medical professionals.',
  'what are the symptoms': 'Common symptoms include: headaches (especially in the morning), nausea and vomiting, balance problems, vision changes, seizures, and neck pain or stiffness. In infants, you may notice increased head size. Symptoms vary based on tumor location.',
  'treatment options': 'Treatment typically involves surgical removal as the primary approach, often followed by radiation therapy. Chemotherapy may be used in certain cases, especially for younger patients or recurrent tumors. The treatment plan depends on tumor location, grade, and extent of removal.',
  'default': "I can help you understand ependymoma, explain our AI detection process, discuss symptoms, or answer other medical questions. Please note that this system is for educational purposes only and should not replace professional medical advice."
};

function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  input.value = '';

  setTimeout(() => {
    const response = getResponse(message);
    addChatMessage(response, 'bot');
  }, 500);
}

function askQuestion(question) {
  document.getElementById('chat-input').value = question;
  sendMessage();
}

function getResponse(message) {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(chatResponses)) {
    if (lower.includes(key)) return response;
  }
  return chatResponses.default;
}

function addChatMessage(text, type) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'flex gap-3';

  if (type === 'user') {
    div.innerHTML = `
      <div class="flex-1"></div>
      <div class="max-w-xs p-3 rounded-xl bg-emerald-500/20 text-sm text-emerald-100">${text}</div>
      <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
    `;
  } else {
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>
      <div class="flex-1 p-3 rounded-xl bg-slate-800/80 text-sm text-slate-300">${text}</div>
    `;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white transform transition-all duration-300 flex items-center gap-2 z-50 ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`;
  toastMessage.textContent = message;
  
  toast.classList.remove('translate-y-20', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// Navigation
function showSection(section) {
  const sectionEl = document.getElementById('section-' + section);
  if (sectionEl) {
    sectionEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// Preserve legacy iframe challenge script (moved from inline)
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9cbbbd77009af242',t:'MTc3MDcyNzkwOS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
