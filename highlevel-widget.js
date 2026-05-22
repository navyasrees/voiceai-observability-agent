(function() {
  if (document.getElementById('voiceai-copilot-container')) return;

  // Container
  const container = document.createElement('div');
  container.id = 'voiceai-copilot-container';
  container.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 420px;
    height: 100vh;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    transition: transform 0.3s ease;
  `;

  // Header bar
  const header = document.createElement('div');
  header.style.cssText = `
    background: #0f3460;
    color: white;
    padding: 12px 16px;
    font-family: Inter, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  `;
  header.innerHTML = `
    <span>Voice AI Copilot</span>
    <span id='voiceai-toggle-icon'>✕</span>
  `;

  // iFrame
  const iframe = document.createElement('iframe');
  iframe.src = 'https://voiceai-observability-agent-fronten.vercel.app';
  iframe.style.cssText = `
    width: 100%;
    flex: 1;
    border: none;
    background: #f8f9fc;
  `;
  iframe.allow = 'same-origin';

  // Toggle button (when panel is hidden)
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'voiceai-open-btn';
  toggleBtn.innerText = 'Voice AI Copilot';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f3460;
    color: white;
    border: none;
    border-radius: 24px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 99998;
    display: none;
    font-family: Inter, system-ui, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;

  // Toggle logic
  let isOpen = true;

  header.addEventListener('click', function() {
    isOpen = false;
    container.style.transform = 'translateX(100%)';
    toggleBtn.style.display = 'block';
  });

  toggleBtn.addEventListener('click', function() {
    isOpen = true;
    container.style.transform = 'translateX(0)';
    toggleBtn.style.display = 'none';
  });

  container.appendChild(header);
  container.appendChild(iframe);
  document.body.appendChild(container);
  document.body.appendChild(toggleBtn);
})();
