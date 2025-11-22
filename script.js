// ======================
// VARIÁVEIS GLOBAIS
// ======================
let totalMs = 300000;
let currentMs = 300000;
const TICK_MS = 100;
let interval = null;
let isRunning = false;
let mode = 'countdown';
let finishSound = null;
let soundData = null;
let isSoundPlaying = false;

// ======================
// SISTEMA DE SOM
// ======================
function toggleSound() {
    const enabled = document.getElementById('soundEnabled').checked;
    const controls = document.getElementById('soundControls');
    controls.style.display = enabled ? 'block' : 'none';
}

function handleSoundUpload() {
    const file = document.getElementById('soundFile').files[0];
    
    if (!file) return;
    
    // Verificar tamanho (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
        alert('Arquivo muito grande! O som deve ter no máximo 2MB.');
        document.getElementById('soundFile').value = '';
        return;
    }
    
    // Verificar tipo
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
        alert('Formato inválido! Use MP3, WAV ou OGG.');
        document.getElementById('soundFile').value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        soundData = e.target.result;
        finishSound = new Audio(soundData);
        finishSound.volume = document.getElementById('soundVolume').value / 100;
        document.getElementById('soundInfo').style.display = 'block';
        
        // Salvar no localStorage
        localStorage.setItem('timerSoundData', soundData);
        localStorage.setItem('timerSoundName', file.name);
    };
    reader.readAsDataURL(file);
}

function updateVolume() {
    const volume = document.getElementById('soundVolume').value;
    document.getElementById('volume-val').textContent = volume + '%';
    
    if (finishSound) {
        finishSound.volume = volume / 100;
    }
    
    localStorage.setItem('timerSoundVolume', volume);
}

function testSound() {
    if (!finishSound) {
        alert('Por favor, faça upload de um som primeiro!');
        return;
    }
    
    const btn = document.getElementById('testSoundBtn');
    
    if (isSoundPlaying) {
        // Parar o som
        finishSound.pause();
        finishSound.currentTime = 0;
        isSoundPlaying = false;
        btn.textContent = '🔊 Testar Som';
        btn.style.background = 'rgba(0, 0, 0, 0.7)';
    } else {
        // Tocar o som
        finishSound.currentTime = 0;
        finishSound.play().catch(err => {
            console.error('Erro ao reproduzir som:', err);
            alert('Erro ao reproduzir o som. Tente outro arquivo.');
            isSoundPlaying = false;
            btn.textContent = '🔊 Testar Som';
            btn.style.background = 'rgba(0, 0, 0, 0.7)';
            return;
        });
        
        isSoundPlaying = true;
        btn.textContent = '⏹ Parar Som';
        btn.style.background = 'rgba(255, 50, 50, 0.5)';
        
        // Resetar botão quando o som terminar
        finishSound.onended = () => {
            isSoundPlaying = false;
            btn.textContent = '🔊 Testar Som';
            btn.style.background = 'rgba(0, 0, 0, 0.7)';
        };
    }
}

function playFinishSound() {
    const enabled = document.getElementById('soundEnabled').checked;
    if (enabled && finishSound) {
        finishSound.currentTime = 0;
        finishSound.play().catch(err => {
            console.error('Erro ao reproduzir som:', err);
        });
    }
}

function loadSoundSettings() {
    const savedData = localStorage.getItem('timerSoundData');
    const savedVolume = localStorage.getItem('timerSoundVolume');
    const savedEnabled = localStorage.getItem('timerSoundEnabled');
    
    if (savedVolume) {
        document.getElementById('soundVolume').value = savedVolume;
        updateVolume();
    }
    
    if (savedEnabled === 'true') {
        document.getElementById('soundEnabled').checked = true;
        toggleSound();
    }
    
    if (savedData) {
        soundData = savedData;
        finishSound = new Audio(savedData);
        finishSound.volume = document.getElementById('soundVolume').value / 100;
        document.getElementById('soundInfo').style.display = 'block';
    }
}

// ======================
// SISTEMA DE PRESETS
// ======================
function getCurrentConfig() {
    return {
        mode: mode,
        days: document.getElementById('days').value,
        hours: document.getElementById('hours').value,
        minutes: document.getElementById('minutes').value,
        seconds: document.getElementById('seconds').value,
        milliseconds: document.getElementById('milliseconds').value,
        unitDays: document.getElementById('unit-days').checked,
        unitHours: document.getElementById('unit-hours').checked,
        unitMinutes: document.getElementById('unit-minutes').checked,
        unitSeconds: document.getElementById('unit-seconds').checked,
        unitMilliseconds: document.getElementById('unit-milliseconds').checked,
        outlineR: document.getElementById('outline-r').value,
        outlineG: document.getElementById('outline-g').value,
        outlineB: document.getElementById('outline-b').value,
        outlineA: document.getElementById('outline-a').value,
        liquidR: document.getElementById('liquid-r').value,
        liquidG: document.getElementById('liquid-g').value,
        liquidB: document.getElementById('liquid-b').value,
        liquidA: document.getElementById('liquid-a').value,
        gradientR: document.getElementById('gradient-r').value,
        gradientG: document.getElementById('gradient-g').value,
        gradientB: document.getElementById('gradient-b').value,
        gradientA: document.getElementById('gradient-a').value,
        gradientBalance: document.getElementById('gradient-balance').value,
        fillR: document.getElementById('fill-r').value,
        fillG: document.getElementById('fill-g').value,
        fillB: document.getElementById('fill-b').value,
        fillA: document.getElementById('fill-a').value,
        bgR: document.getElementById('bg-r').value,
        bgG: document.getElementById('bg-g').value,
        bgB: document.getElementById('bg-b').value,
        bgA: document.getElementById('bg-a').value,
        soundEnabled: document.getElementById('soundEnabled').checked,
        soundVolume: document.getElementById('soundVolume').value,
        outlineWidth: document.getElementById('outlineWidth').value,
        outlineEnabled: document.getElementById('outlineEnabled').checked,
        fontFamily: document.getElementById('fontFamily').value,
        fontSize: document.getElementById('fontSize').value
    };
}

function applyConfig(config) {
    // Modo
    const modeButtons = document.querySelectorAll('.mode-btn');
    setMode(config.mode, config.mode === 'countdown' ? modeButtons[0] : modeButtons[1]);
    
    // Duração
    document.getElementById('days').value = config.days;
    document.getElementById('hours').value = config.hours;
    document.getElementById('minutes').value = config.minutes;
    document.getElementById('seconds').value = config.seconds;
    document.getElementById('milliseconds').value = config.milliseconds;
    
    // Unidades
    document.getElementById('unit-days').checked = config.unitDays;
    document.getElementById('unit-hours').checked = config.unitHours;
    document.getElementById('unit-minutes').checked = config.unitMinutes;
    document.getElementById('unit-seconds').checked = config.unitSeconds;
    document.getElementById('unit-milliseconds').checked = config.unitMilliseconds;
    
    // Cores
    document.getElementById('outline-r').value = config.outlineR;
    document.getElementById('outline-g').value = config.outlineG;
    document.getElementById('outline-b').value = config.outlineB;
    document.getElementById('outline-a').value = config.outlineA;
    
    document.getElementById('liquid-r').value = config.liquidR;
    document.getElementById('liquid-g').value = config.liquidG;
    document.getElementById('liquid-b').value = config.liquidB;
    document.getElementById('liquid-a').value = config.liquidA;
    
    document.getElementById('gradient-r').value = config.gradientR;
    document.getElementById('gradient-g').value = config.gradientG;
    document.getElementById('gradient-b').value = config.gradientB;
    document.getElementById('gradient-a').value = config.gradientA;
    document.getElementById('gradient-balance').value = config.gradientBalance;
    
    document.getElementById('fill-r').value = config.fillR;
    document.getElementById('fill-g').value = config.fillG;
    document.getElementById('fill-b').value = config.fillB;
    document.getElementById('fill-a').value = config.fillA;
    
    document.getElementById('bg-r').value = config.bgR;
    document.getElementById('bg-g').value = config.bgG;
    document.getElementById('bg-b').value = config.bgB;
    document.getElementById('bg-a').value = config.bgA;
    
    // Borda
    if (config.outlineWidth !== undefined) {
        document.getElementById('outlineWidth').value = config.outlineWidth;
        document.getElementById('outlineWidthVal').textContent = config.outlineWidth + 'px';
    }
    if (config.outlineEnabled !== undefined) {
        document.getElementById('outlineEnabled').checked = config.outlineEnabled;
    }
    
    // Fonte
    if (config.fontFamily !== undefined) {
        document.getElementById('fontFamily').value = config.fontFamily;
    }
    if (config.fontSize !== undefined) {
        document.getElementById('fontSize').value = config.fontSize;
        document.getElementById('fontSizeVal').textContent = config.fontSize + 'px';
    }
    
    // Som
    if (config.soundEnabled !== undefined) {
        document.getElementById('soundEnabled').checked = config.soundEnabled;
        toggleSound();
    }
    if (config.soundVolume !== undefined) {
        document.getElementById('soundVolume').value = config.soundVolume;
        updateVolume();
    }
    
    // Sincronizar color pickers
    updateFromRGBA('outline');
    updateFromRGBA('liquid');
    updateFromRGBA('gradient');
    updateFromRGBA('fill');
    updateFromRGBA('bg');
    updateGradientBalance();
    
    applySettings();
    applyColors();
}

function savePreset() {
    const name = document.getElementById('presetName').value.trim();
    if (!name) {
        alert('Por favor, digite um nome para o preset!');
        return;
    }
    
    const presets = JSON.parse(localStorage.getItem('timerPresets') || '{}');
    presets[name] = getCurrentConfig();
    localStorage.setItem('timerPresets', JSON.stringify(presets));
    
    // Salvar estado do som habilitado
    localStorage.setItem('timerSoundEnabled', document.getElementById('soundEnabled').checked);
    
    document.getElementById('presetName').value = '';
    loadPresets();
    alert(`Preset "${name}" salvo com sucesso!`);
}

function saveAsDefault() {
    const config = getCurrentConfig();
    localStorage.setItem('timerDefault', JSON.stringify(config));
    loadPresets();
    alert('Configuração salva como padrão!');
}

function loadPreset(name) {
    const presets = JSON.parse(localStorage.getItem('timerPresets') || '{}');
    if (presets[name]) {
        applyConfig(presets[name]);
    }
}

function deletePreset(name) {
    if (!confirm(`Deseja realmente deletar o preset "${name}"?`)) return;
    
    const presets = JSON.parse(localStorage.getItem('timerPresets') || '{}');
    delete presets[name];
    localStorage.setItem('timerPresets', JSON.stringify(presets));
    loadPresets();
}

function loadDefaultPreset() {
    const defaultConfig = localStorage.getItem('timerDefault');
    if (defaultConfig) {
        applyConfig(JSON.parse(defaultConfig));
    }
}

function loadPresets() {
    const presets = JSON.parse(localStorage.getItem('timerPresets') || '{}');
    const defaultConfig = localStorage.getItem('timerDefault');
    const presetList = document.getElementById('presetList');
    
    if (Object.keys(presets).length === 0 && !defaultConfig) {
        presetList.innerHTML = '<div style="color: #aaa; font-size: 12px; text-align: center; padding: 10px;">Nenhum preset salvo</div>';
        return;
    }
    
    let html = '';
    
    // Preset padrão
    if (defaultConfig) {
        html += `
            <div class="preset-item default">
                <button onclick="loadDefaultPreset()">⭐ Padrão</button>
                <button class="delete-btn" onclick="localStorage.removeItem('timerDefault'); loadPresets();">✕</button>
            </div>
        `;
    }
    
    // Outros presets
    Object.keys(presets).sort().forEach(name => {
        html += `
            <div class="preset-item">
                <button onclick="loadPreset('${name}')">${name}</button>
                <button class="delete-btn" onclick="deletePreset('${name}')">✕</button>
            </div>
        `;
    });
    
    presetList.innerHTML = html;
}

// ======================
// CONTROLES DE UI
// ======================
function toggleControls() {
    document.getElementById('controlsPanel').classList.toggle('hidden');
}

// ======================
// FORMATAÇÃO DE TEMPO
// ======================
function getSelectedUnits() {
    const units = [];
    ['days', 'hours', 'minutes', 'seconds', 'milliseconds'].forEach(unit => {
        if (document.getElementById(`unit-${unit}`)?.checked) units.push(unit);
    });
    return units.length ? units : ['minutes', 'seconds'];
}

function formatDisplayTime(totalMs) {
    const units = getSelectedUnits();
    let remaining = Math.max(0, totalMs);

    const values = {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000),
        seconds: Math.floor((remaining % 60000) / 1000),
        milliseconds: remaining % 1000
    };

    const mainUnits = units.filter(u => u !== 'milliseconds');
    const segments = mainUnits.map(u => String(values[u]).padStart(2, '0'));
    let text = segments.join(':');

    if (units.includes('milliseconds')) {
        const centis = Math.floor(values.milliseconds / 10);
        text = text ? `${text}.${String(centis).padStart(2, '0')}` : String(centis).padStart(2, '0');
    }

    return text || '00:00';
}

// ======================
// ATUALIZAÇÃO DE DISPLAY
// ======================
function updateDisplay() {
    const displayMs = mode === 'countdown' ? currentMs : (totalMs - currentMs);
    const display = formatDisplayTime(displayMs);

    document.getElementById('timer-base').textContent = display;
    document.getElementById('timer-liquid').textContent = display;

    const percentage = totalMs > 0 ? (mode === 'countdown' ? (currentMs / totalMs) * 100 : ((totalMs - currentMs) / totalMs) * 100) : 0;
    updateClipPath(percentage);
}

function updateClipPath(percentage) {
    const topEdgeValue = parseFloat(document.getElementById('liquidTopEdge')?.value) || 22;
    document.getElementById('liquidTopEdge-val').textContent = topEdgeValue;
    const topEdge = 100 - (topEdgeValue + (percentage / 100) * 60);
    const keyframes = `
        @keyframes waveAnimation {
            0%, 100% {
                clip-path: polygon(
                    0% ${topEdge}%, 10% ${topEdge-2}%, 20% ${topEdge-3}%, 30% ${topEdge-2}%, 40% ${topEdge+1}%,
                    50% ${topEdge+2}%, 60% ${topEdge+1}%, 70% ${topEdge-1}%, 80% ${topEdge-2}%, 90% ${topEdge-1}%,
                    100% ${topEdge}%, 100% 100%, 0% 100%
                );
            }
            50% {
                clip-path: polygon(
                    0% ${topEdge+2}%, 10% ${topEdge+3}%, 20% ${topEdge+2}%, 30% ${topEdge}%, 40% ${topEdge-2}%,
                    50% ${topEdge-3}%, 60% ${topEdge-2}%, 70% ${topEdge+1}%, 80% ${topEdge+2}%, 90% ${topEdge+3}%,
                    100% ${topEdge+2}%, 100% 100%, 0% 100%
                );
            }
        }
    `;

    const sheet = document.styleSheets[0];
    for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
        if (sheet.cssRules[i].name === 'waveAnimation') {
            sheet.deleteRule(i);
            break;
        }
    }
    sheet.insertRule(keyframes, sheet.cssRules.length);
}

// ======================
// CONTROLE DO TIMER
// ======================
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    interval = setInterval(() => {
        if (currentMs > 0) {
            currentMs = Math.max(0, currentMs - TICK_MS);
            updateDisplay();
        } else {
            pauseTimer();
            playFinishSound();
        }
    }, TICK_MS);
}

function pauseTimer() {
    isRunning = false;
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

function resetTimer() {
    pauseTimer();
    currentMs = totalMs;
    updateDisplay();
}

function applySettings() {
    const days = parseInt(document.getElementById('days').value) || 0;
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    const millis = Math.max(0, Math.min(999, parseInt(document.getElementById('milliseconds').value) || 0));

    totalMs = ((((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000) + millis;
    currentMs = Math.max(0, totalMs);
    updateDisplay();
}

function setMode(newMode, btn) {
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    resetTimer();
}

// ======================
// SISTEMA DE CORES
// ======================
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function updateFromPicker(type) {
    const colorId = type === 'gradient' ? 'liquidGradientColor' : 
                  type === 'liquid' ? 'liquidColor' : 
                  type === 'outline' ? 'outlineColor' :
                  type === 'fill' ? 'fillColor' : 'bgColor';
    
    const color = document.getElementById(colorId).value;
    const rgb = hexToRgb(color);
    
    const prefix = type;
    document.getElementById(`${prefix}-r`).value = rgb.r;
    document.getElementById(`${prefix}-g`).value = rgb.g;
    document.getElementById(`${prefix}-b`).value = rgb.b;
    
    applyColors();
}

function updateFromRGBA(type) {
    const r = parseInt(document.getElementById(`${type}-r`).value) || 0;
    const g = parseInt(document.getElementById(`${type}-g`).value) || 0;
    const b = parseInt(document.getElementById(`${type}-b`).value) || 0;
    
    const hex = rgbToHex(
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, g)),
        Math.max(0, Math.min(255, b))
    );
    
    const colorId = type === 'gradient' ? 'liquidGradientColor' : 
                  type === 'liquid' ? 'liquidColor' : 
                  type === 'outline' ? 'outlineColor' :
                  type === 'fill' ? 'fillColor' : 'bgColor';
    
    document.getElementById(colorId).value = hex;
    applyColors();
}

function updateGradientBalance() {
    const balance = document.getElementById('gradient-balance').value;
    document.getElementById('gradient-balance-val').textContent = balance + '%';
    applyColors();
}

function getRGBA(type) {
    const r = Math.max(0, Math.min(255, parseInt(document.getElementById(`${type}-r`).value) || 0));
    const g = Math.max(0, Math.min(255, parseInt(document.getElementById(`${type}-g`).value) || 0));
    const b = Math.max(0, Math.min(255, parseInt(document.getElementById(`${type}-b`).value) || 0));
    const a = Math.max(0, Math.min(100, parseInt(document.getElementById(`${type}-a`).value) || 100)) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function applyColors() {
    const base = document.getElementById('timer-base');
    const liquid = document.getElementById('timer-liquid');
    
    // Contorno
    const outlineColor = getRGBA('outline');
    const outlineWidth = document.getElementById('outlineWidth').value;
    const outlineEnabled = document.getElementById('outlineEnabled').checked;
    
    if (outlineEnabled) {
        base.style.webkitTextStroke = `${outlineWidth}px ${outlineColor}`;
        base.style.textStroke = `${outlineWidth}px ${outlineColor}`;
    } else {
        base.style.webkitTextStroke = 'none';
        base.style.textStroke = 'none';
    }
    
    // Preenchimento
    base.style.color = getRGBA('fill');
    
    // Líquido com degradê e equilíbrio
    const liquidTop = getRGBA('liquid');
    const liquidBottom = getRGBA('gradient');
    const balance = parseInt(document.getElementById('gradient-balance').value) || 50;
    
    liquid.style.background = `linear-gradient(180deg, ${liquidTop} 0%, ${liquidTop} ${balance}%, ${liquidBottom} 100%)`;
    liquid.style.webkitBackgroundClip = 'text';
    liquid.style.backgroundClip = 'text';
    liquid.style.webkitTextFillColor = 'transparent';
    
    // Fundo
    document.body.style.background = getRGBA('bg');
}

// ======================
// INICIALIZAÇÃO
// Controle do limite superior do líquido
function updateLiquidTopEdge() {
    const val = document.getElementById('liquidTopEdge').value;
    document.getElementById('liquidTopEdge-val').textContent = val;
    localStorage.setItem('liquidTopEdge', val);
    updateDisplay();
}

function loadLiquidTopEdge() {
    const val = localStorage.getItem('liquidTopEdge');
    if (val !== null) {
        document.getElementById('liquidTopEdge').value = val;
        document.getElementById('liquidTopEdge-val').textContent = val;
    }
}
// ======================
// CONTROLE DE FONTE E TAMANHO
function updateFont() {
    const font = document.getElementById('fontFamily').value;
    const size = parseInt(document.getElementById('fontSize').value) || 150;
    document.getElementById('timer-base').style.fontFamily = font;
    document.getElementById('timer-liquid').style.fontFamily = font;
    document.getElementById('timer-base').style.fontSize = size + 'px';
    document.getElementById('timer-liquid').style.fontSize = size + 'px';
    document.getElementById('fontSizeVal').textContent = size + 'px';
    localStorage.setItem('timerFontFamily', font);
    localStorage.setItem('timerFontSize', size);
}

function loadFontSettings() {
    const font = localStorage.getItem('timerFontFamily');
    const size = localStorage.getItem('timerFontSize');
    if (font) {
        document.getElementById('fontFamily').value = font;
        document.getElementById('timer-base').style.fontFamily = font;
        document.getElementById('timer-liquid').style.fontFamily = font;
    }
    if (size) {
        document.getElementById('fontSize').value = size;
        document.getElementById('fontSizeVal').textContent = size + 'px';
        document.getElementById('timer-base').style.fontSize = size + 'px';
        document.getElementById('timer-liquid').style.fontSize = size + 'px';
    }
}

// ======================
// CONTROLE DE BORDA
// ======================
function updateOutlineWidth() {
    const width = document.getElementById('outlineWidth').value;
    document.getElementById('outlineWidthVal').textContent = width + 'px';
    localStorage.setItem('timerOutlineWidth', width);
    applyColors();
}

function toggleOutline() {
    const enabled = document.getElementById('outlineEnabled').checked;
    localStorage.setItem('timerOutlineEnabled', enabled);
    applyColors();
}

function loadOutlineSettings() {
    const width = localStorage.getItem('timerOutlineWidth');
    const enabled = localStorage.getItem('timerOutlineEnabled');
    if (width) {
        document.getElementById('outlineWidth').value = width;
        document.getElementById('outlineWidthVal').textContent = width + 'px';
    }
    if (enabled !== null) {
        document.getElementById('outlineEnabled').checked = enabled === 'true';
    }
}

updateDisplay();
applyColors();
loadPresets();
loadSoundSettings();
window.addEventListener('load', () => {
    loadDefaultPreset();
    loadFontSettings();
    loadOutlineSettings();
    loadLiquidTopEdge();
    updateDisplay();
});