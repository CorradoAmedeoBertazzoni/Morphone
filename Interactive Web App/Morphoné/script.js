// script3.js - Morphoné Robust Mac/Safari Engine

function showSection(sectionId) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');
}

function showHome() {
    stopAllAudio();
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById('home').classList.add('active');
}

function stopAllAudio() {
    const players = document.querySelectorAll('audio');
    players.forEach(player => {
        player.pause();
        player.currentTime = 0; 
        updateTime(player); 
        const playButton = document.querySelector(`button[onclick*="${player.id}"]`);
        if (playButton) playButton.classList.remove('playing');
    });
    stopInteractive('sec1');
    stopInteractive('sec2');
    stopInteractive('sec3');
}

function togglePlayPause(audioId) {
    const targetAudio = document.getElementById(audioId);
    if (!targetAudio) return;


    const players = document.querySelectorAll('audio');
    const playButton = document.querySelector(`button[onclick*="${audioId}"]`);

    players.forEach(player => {
        if (player.id !== audioId) {
            player.pause();
            player.currentTime = 0;
            updateTime(player);
            const otherBtn = document.querySelector(`button[onclick*="${player.id}"]`);
            if (otherBtn) otherBtn.classList.remove('playing');
        }
    });

    if (targetAudio.paused) {
        targetAudio.play().then(() => {
            if (playButton) playButton.classList.add('playing');
        }).catch(err => console.log("Play error:", err));
    } else {
        targetAudio.pause();
        if (playButton) playButton.classList.remove('playing');
    }
}

function stopAudio(audioId) {
    const targetAudio = document.getElementById(audioId);
    if (targetAudio) {
        targetAudio.pause();
        targetAudio.currentTime = 0; 
        updateTime(targetAudio);
        const playButton = document.querySelector(`button[onclick*="${audioId}"]`);
        if (playButton) playButton.classList.remove('playing');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateTime(player) {
    const displayElement = document.getElementById(`time-${player.id}`);
    const seekBar = document.getElementById(`seek-${player.id}`);
    
    if (displayElement) {
        displayElement.textContent = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`;
    }
    
    if (seekBar && player.duration) {
        seekBar.value = (player.currentTime / player.duration) * 100;
    }
}

// --- WEB AUDIO ENGINE REFACTORED ---
let audioCtx = null;
const panners = {};
let activeKnob = null;
const SEC1_INSTRUMENT_OFFSET = 1.96;

document.addEventListener('DOMContentLoaded', () => {
    const dropdownContainers = document.querySelectorAll('.dropdown-menu, .secondary-dropdown');

    dropdownContainers.forEach(container => {
        const content = container.querySelector('.dropdown-content');
        let closeTimeout = null;

        if (!content) return;

        container.addEventListener('mouseenter', () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
            content.classList.add('show');
        });

        container.addEventListener('mouseleave', () => {
            if (closeTimeout) clearTimeout(closeTimeout);
            closeTimeout = setTimeout(() => {
                content.classList.remove('show');
            }, 500); 
        });
    });
});

function toggleDropdown() {
    const event = window.event;
    if (event) event.stopPropagation();
    const clickedBtn = event ? event.target : null;
    if (clickedBtn) {
        const container = clickedBtn.closest('.dropdown-menu');
        if (container) {
            const content = container.querySelector('.dropdown-content');
            if (content) {
                document.querySelectorAll('.dropdown-content').forEach(el => {
                    if (el !== content) el.classList.remove('show');
                });
                content.classList.toggle('show');
            }
        }
    }
}

function toggleSecondaryDropdown(event, id) {
    if (event) event.stopPropagation();
    const dropdownContent = document.getElementById(id);
    if (dropdownContent) {
        document.querySelectorAll('.dropdown-content').forEach(el => {
            if (el !== dropdownContent) el.classList.remove('show');
        });
        dropdownContent.classList.toggle('show');
    }
}

window.addEventListener('click', (event) => {
    if (!event.target.matches('.dropdown-btn')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) dropdown.classList.remove('show');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initKnobs();
    setupSliderTooltips();

    const players = document.querySelectorAll('audio');
    players.forEach(player => {
        const seekBar = document.getElementById(`seek-${player.id}`);
        player.addEventListener('loadedmetadata', () => updateTime(player));
        player.addEventListener('timeupdate', () => updateTime(player));
        player.addEventListener('ended', () => {
            player.currentTime = 0;
            updateTime(player);
            const playButton = document.querySelector(`button[onclick*="${player.id}"]`);
            if (playButton) playButton.classList.remove('playing');
        });

        if (seekBar) {
            seekBar.addEventListener('input', () => {
                if (player.duration) player.currentTime = (seekBar.value / 100) * player.duration;
            });
        }
    });

    setupInteractiveProgress('sec1');
    setupInteractiveProgress('sec2');
    setupInteractiveProgress('sec3');
});

function exitInteractive(targetSectionId) {
    stopInteractive('sec1');
    stopInteractive('sec2');
    stopInteractive('sec3');
    stopAudio('audio-sec1-int-exp');
    stopAudio('audio-sec2-int-exp');
    stopAudio('audio-sec3-int-exp');

    const backingBtn = document.getElementById('btn-sec1-backing');
    const backingAudio = document.getElementById('audio-sec1-int-backing');
    if (backingBtn && backingAudio) {
        backingBtn.classList.add('active');
        backingAudio.volume = 0.8;
    }

    if (targetSectionId === 'home') {
        showHome();
    } else {
        showSection(targetSectionId);
    }
}

function toggleInteractivePlay(secId) {
    const leftAudio = document.getElementById(`audio-${secId}-int-left`);
    const rightAudio = document.getElementById(`audio-${secId}-int-right`);
    const backingAudio = document.getElementById(`audio-${secId}-int-backing`);
    const playButton = document.getElementById(`play-${secId}-int`);

    if (!leftAudio || !rightAudio) return;

    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
        if (audio.id !== `audio-${secId}-int-left` && 
            audio.id !== `audio-${secId}-int-right` && 
            audio.id !== `audio-${secId}-int-backing`) {
            audio.pause();
            if (!audio.id.includes('-int-')) {
                audio.currentTime = 0;
                updateTime(audio);
                const playBtn = document.querySelector(`button[onclick*="${audio.id}"]`);
                if (playBtn) playBtn.classList.remove('playing');
            }
        }
    });

    const otherSecIds = ['sec1', 'sec2', 'sec3'].filter(id => id !== secId);
    otherSecIds.forEach(otherId => stopInteractive(otherId));

    if (secId === 'sec1' && backingAudio) {
        if (backingAudio.paused) {
            backingAudio.play();
            if (backingAudio.currentTime >= SEC1_INSTRUMENT_OFFSET) {
                leftAudio.currentTime = backingAudio.currentTime - SEC1_INSTRUMENT_OFFSET;
                rightAudio.currentTime = backingAudio.currentTime - SEC1_INSTRUMENT_OFFSET;
                leftAudio.play();
                rightAudio.play();
            }  
            if (playButton) playButton.classList.add('playing');
        } else {
            backingAudio.pause();
            leftAudio.pause();
            rightAudio.pause();
            if (playButton) playButton.classList.remove('playing');
        }
    } else {
        if (leftAudio.paused) {
            rightAudio.currentTime = leftAudio.currentTime;
            leftAudio.play();
            rightAudio.play();
            if (playButton) playButton.classList.add('playing');
        } else {
            leftAudio.pause();
            rightAudio.pause();
            if (playButton) playButton.classList.remove('playing');
        }
    }
}

function stopInteractive(secId) {
    const leftAudio = document.getElementById(`audio-${secId}-int-left`);
    const rightAudio = document.getElementById(`audio-${secId}-int-right`);
    const backingAudio = document.getElementById(`audio-${secId}-int-backing`);
    const playButton = document.getElementById(`play-${secId}-int`);

    if (leftAudio) { leftAudio.pause(); leftAudio.currentTime = 0; }
    if (rightAudio) { rightAudio.pause(); rightAudio.currentTime = 0; }
    if (backingAudio) { backingAudio.pause(); backingAudio.currentTime = 0; }
    if (playButton) playButton.classList.remove('playing');
}

function crossfade(secId, value) {
    const leftAudio = document.getElementById(`audio-${secId}-int-left`);
    const rightAudio = document.getElementById(`audio-${secId}-int-right`);

    if (!leftAudio || !rightAudio) return;

    let leftVolume, rightVolume;
    const val = parseInt(value);

    // Mappatura lineare dei volumi con centro al 75%
    if (val <= 50) {
        // Da Sx (0) al Centro (50)
        // Sx passa da 100% (1.0) a 75% (0.75)
        leftVolume = 1.0 - (0.25 * (val / 50));
        // Dx passa da 0% (0.0) a 75% (0.75)
        rightVolume = 0.75 * (val / 50); 
    } else {
        // Dal Centro (50) a Dx (100)
        // Sx passa da 75% (0.75) a 0% (0.0)
        leftVolume = 0.75 - (0.75 * ((val - 50) / 50));
        // Dx passa da 75% (0.75) a 100% (1.0)
        rightVolume = 0.75 + (0.25 * ((val - 50) / 50));
    }

    // Assicuriamoci che i volumi rimangano nei limiti di sicurezza dell'API Web Audio [0.0, 1.0]
    leftAudio.volume = Math.max(0, Math.min(1, leftVolume));
    rightAudio.volume = Math.max(0, Math.min(1, rightVolume));

    updateSliderUI(secId, value);
}

function updateSliderUI(secId, value) {
    const slider = document.getElementById(`fader-${secId}`);
    const tooltip = document.getElementById(`tooltip-${secId}`);
    if (!slider || !tooltip) return;

    const val = parseInt(value);
    let displayPercent = 50;
    if (val <= 50) {
        displayPercent = 100 - val;
    } else {
        displayPercent = val;
    }
    tooltip.textContent = `${displayPercent}%`;

    let r, g, b;
    if (val <= 50) {
        const t = val / 50; 
        r = Math.round(36 + (139 - 36) * t);
        g = Math.round(129 + (92 - 129) * t);
        b = Math.round(204 + (246 - 204) * t);
    } else {
        const t = (val - 50) / 50; 
        r = Math.round(139 + (255 - 139) * t);
        g = Math.round(92 + (143 - 92) * t);
        b = Math.round(246 + (0 - 246) * t);
    }

    const activeColor = `rgb(${r}, ${g}, ${b})`;
    slider.style.setProperty('--slider-accent-color', activeColor);
    tooltip.style.setProperty('--slider-accent-color', activeColor);
    tooltip.style.borderColor = activeColor;

    tooltip.style.left = `calc(${val}% + (${12 - val * 0.24}px))`;
}

function setupSliderTooltips() {
    ['sec1', 'sec2', 'sec3'].forEach(secId => {
        const slider = document.getElementById(`fader-${secId}`);
        const tooltip = document.getElementById(`tooltip-${secId}`);
        if (slider && tooltip) {
            updateSliderUI(secId, slider.value); 

            const show = () => tooltip.classList.add('visible');
            const hide = () => tooltip.classList.remove('visible');

            slider.addEventListener('mousedown', show);
            slider.addEventListener('touchstart', show);
            slider.addEventListener('mouseup', hide);
            slider.addEventListener('touchend', hide);
            slider.addEventListener('input', show);
        }
    });
}

function updateSliderUI(secId, value) {
    const slider = document.getElementById(`fader-${secId}`);
    const tooltip = document.getElementById(`tooltip-${secId}`);
    if (!slider || !tooltip) return;

    const val = parseInt(value);

    let displayPercent = 50;
    if (val <= 50) {
        displayPercent = 100 - val;
    } else {
        displayPercent = val;
    }
    tooltip.textContent = `${displayPercent}%`;

    let r, g, b;
    if (val <= 50) {
        const t = val / 50; 
        r = Math.round(36 + (139 - 36) * t);
        g = Math.round(129 + (92 - 129) * t);
        b = Math.round(204 + (246 - 204) * t);
    } else {
        const t = (val - 50) / 50; 
        r = Math.round(139 + (255 - 139) * t);
        g = Math.round(92 + (143 - 92) * t);
        b = Math.round(246 + (0 - 246) * t);
    }

    const activeColor = `rgb(${r}, ${g}, ${b})`;
    slider.style.setProperty('--slider-accent-color', activeColor);
    tooltip.style.setProperty('--slider-accent-color', activeColor);
    tooltip.style.borderColor = activeColor;

    tooltip.style.left = `calc(${val}% + (${12 - val * 0.24}px))`;
}

function setupSliderTooltips() {
    ['sec1', 'sec2', 'sec3'].forEach(secId => {
        const slider = document.getElementById(`fader-${secId}`);
        const tooltip = document.getElementById(`tooltip-${secId}`);
        if (slider && tooltip) {
            updateSliderUI(secId, slider.value); 

            const show = () => tooltip.classList.add('visible');
            const hide = () => tooltip.classList.remove('visible');

            slider.addEventListener('mousedown', show);
            slider.addEventListener('touchstart', show);
            slider.addEventListener('mouseup', hide);
            slider.addEventListener('touchend', hide);
            slider.addEventListener('input', show);
        }
    });
}

const originalStopAllAudio = stopAllAudio;
stopAllAudio = function() {
    originalStopAllAudio();
    stopInteractive('sec1');
    stopInteractive('sec2');
    stopInteractive('sec3');
};

function setupInteractiveProgress(secId) {
    const leftAudio = document.getElementById(`audio-${secId}-int-left`);
    const rightAudio = document.getElementById(`audio-${secId}-int-right`);
    const backingAudio = document.getElementById(`audio-${secId}-int-backing`);
    const seekBar = document.getElementById(`seek-${secId}-int`);
    const timeDisplay = document.getElementById(`time-${secId}-int`);

    if (secId === 'sec1' && backingAudio) {
        const updateTimeUI = () => {
            if (timeDisplay) {
                timeDisplay.textContent = `${formatTime(backingAudio.currentTime)} / ${formatTime(backingAudio.duration)}`;
            }
            if (seekBar && backingAudio.duration) {
                seekBar.value = (backingAudio.currentTime / backingAudio.duration) * 100;
            }

            if (!backingAudio.paused) {
                const targetInstrumentTime = backingAudio.currentTime - SEC1_INSTRUMENT_OFFSET;
                
                if (targetInstrumentTime < 0) {
                    if (!leftAudio.paused) leftAudio.pause();
                    if (!rightAudio.paused) rightAudio.pause();
                    leftAudio.currentTime = 0;
                    rightAudio.currentTime = 0;
                } else {
                    if (leftAudio.paused) {
                        leftAudio.currentTime = targetInstrumentTime;
                        rightAudio.currentTime = targetInstrumentTime;
                        leftAudio.play();
                        rightAudio.play();
                    } else if (Math.abs(leftAudio.currentTime - targetInstrumentTime) > 0.15) {
                            leftAudio.currentTime = targetInstrumentTime;
                            rightAudio.currentTime = targetInstrumentTime;
                    }
                }
            }
        };

        backingAudio.addEventListener('loadedmetadata', updateTimeUI);
        backingAudio.addEventListener('timeupdate', updateTimeUI);
        backingAudio.addEventListener('ended', () => stopInteractive('sec1'));

        if (seekBar) {
            seekBar.addEventListener('input', () => {
                if (backingAudio.duration) {
                    const newTime = (seekBar.value / 100) * backingAudio.duration;
                    backingAudio.currentTime = newTime;
                    const targetInstrumentTime = newTime - SEC1_INSTRUMENT_OFFSET;
                    if (targetInstrumentTime < 0) {
                        leftAudio.currentTime = 0;
                        rightAudio.currentTime = 0;
                        leftAudio.pause();
                        rightAudio.pause();
                    } else {
                        leftAudio.currentTime = targetInstrumentTime;
                        rightAudio.currentTime = targetInstrumentTime;
                        if (!backingAudio.paused) {
                            leftAudio.play();
                            rightAudio.play();
                        }
                    }
                }
            });
        }
    } else {
        if (!leftAudio) return;

        const updateTimeUI = () => {
            if (timeDisplay) {
                timeDisplay.textContent = `${formatTime(leftAudio.currentTime)} / ${formatTime(leftAudio.duration)}`;
            }
            if (seekBar && leftAudio.duration) {
                seekBar.value = (leftAudio.currentTime / leftAudio.duration) * 100;
            }
        };

        leftAudio.addEventListener('loadedmetadata', updateTimeUI);
        leftAudio.addEventListener('timeupdate', updateTimeUI);

        if (seekBar) {
            seekBar.addEventListener('input', () => {
                if (leftAudio.duration) {
                    const newTime = (seekBar.value / 100) * leftAudio.duration;
                    leftAudio.currentTime = newTime;
                    if (rightAudio) {
                        rightAudio.currentTime = newTime;
                    }
                }
            });
        }
    }
}

function switchMode(sectionPrefix, mode) {
    stopAllAudio();
    const soloWrapper = document.getElementById(`${sectionPrefix}-wrapper-solo`);
    const backingWrapper = document.getElementById(`${sectionPrefix}-wrapper-backing`);
    const glider = document.getElementById(`glider-${sectionPrefix}`);
    const buttons = glider.parentElement.querySelectorAll('.mode-btn');

    if (mode === 'solo') {
        soloWrapper.classList.remove('hidden');
        backingWrapper.classList.add('hidden');
        glider.style.transform = 'translateX(0%)';
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        soloWrapper.classList.add('hidden');
        backingWrapper.classList.remove('hidden');
        glider.style.transform = 'translateX(100%)';
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}


function initWebAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function initWebAudioForSection(secId) {
    initWebAudio();
    if (!panners[`${secId}-left`]) {
        const leftAudio = document.getElementById(`audio-${secId}-int-left`);
        const rightAudio = document.getElementById(`audio-${secId}-int-right`);
        
        if (leftAudio && rightAudio) {
            const sourceLeft = audioCtx.createMediaElementSource(leftAudio);
            const pannerLeft = audioCtx.createStereoPanner();
            sourceLeft.connect(pannerLeft);
            pannerLeft.connect(audioCtx.destination);
            panners[`${secId}-left`] = pannerLeft;

            const sourceRight = audioCtx.createMediaElementSource(rightAudio);
            const pannerRight = audioCtx.createStereoPanner();
            sourceRight.connect(pannerRight);
            pannerRight.connect(audioCtx.destination);
            panners[`${secId}-right`] = pannerRight;

            const leftKnob = document.getElementById(`knob-${secId}-left`);
            const rightKnob = document.getElementById(`knob-${secId}-right`);
            if (leftKnob) updatePan(secId, 'left', parseInt(leftKnob.getAttribute('data-angle')));
            if (rightKnob) updatePan(secId, 'right', parseInt(rightKnob.getAttribute('data-angle')));
        }
    }
}

function updatePan(secId, instrument, angleDegrees) {
    const rad = angleDegrees * Math.PI / 180;
    const panValue = Math.sin(rad); 
    const pannerKey = `${secId}-${instrument}`;

    if (panners[pannerKey]) {
        panners[pannerKey].pan.value = panValue;
    }
}

function generateTicks() {
    document.querySelectorAll('.knob-ticks-container').forEach(container => {
        container.innerHTML = '';
        const totalTicks = 11;
        for (let i = 0; i < totalTicks; i++) {
            const angle = -90 + (i * 18);
            const tick = document.createElement('div');
            tick.className = 'knob-tick';
            tick.setAttribute('data-tick-angle', angle);
            tick.style.transform = `rotate(${angle}deg) translateY(-34px)`;
            container.appendChild(tick);
        }
    });
}

function updateActiveTicks(knob, angle) {
    const surround = knob.closest('.knob-surround');
    if (!surround) return;
    surround.querySelectorAll('.knob-tick').forEach(tick => {
        const tickAngle = parseInt(tick.getAttribute('data-tick-angle'));
        if (Math.abs(tickAngle - angle) <= 9) {
            tick.classList.add('active-tick');
        } else {
            tick.classList.remove('active-tick');
        }
    });
}

function initKnobs() {
    generateTicks();
    const knobs = document.querySelectorAll('.knob');
    knobs.forEach(knob => {
        const defaultAngle = parseInt(knob.getAttribute('data-angle')) || 90;
        setKnobAngle(knob, defaultAngle);
        knob.addEventListener('mousedown', startKnobDrag);
        knob.addEventListener('touchstart', startKnobDrag, { passive: false });
    });
}

function startKnobDrag(e) {
    e.preventDefault();
    initWebAudio(); 
    activeKnob = e.currentTarget;
    window.addEventListener('mousemove', dragKnob);
    window.addEventListener('mouseup', stopKnobDrag);
    window.addEventListener('touchmove', dragKnob, { passive: false });
    window.addEventListener('touchend', stopKnobDrag);
}

function dragKnob(e) {
    if (!activeKnob) return;
    e.preventDefault();

    const rect = activeKnob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let angleRad = Math.atan2(clientX - centerX, -(clientY - centerY));
    let angleDeg = Math.round(angleRad * 180 / Math.PI);

    if (angleDeg < -90) angleDeg = -90;
    if (angleDeg > 90) angleDeg = 90;

    setKnobAngle(activeKnob, angleDeg);
}

function setKnobAngle(knob, angle, updateInput = true) {
    knob.setAttribute('data-angle', angle);
    const secId = knob.getAttribute('data-sec');
    const inst = knob.getAttribute('data-inst');
    
    const pointer = knob.querySelector('.knob-pointer');
    if (pointer) {
        pointer.style.transform = `rotate(${angle}deg)`;
    }

    if (updateInput) {
        const valueDisplay = document.getElementById(`val-${secId}-${inst}`);
        if (valueDisplay) {
            valueDisplay.value = angle;
        }
    }

    updatePan(secId, inst, angle);
    updateActiveTicks(knob, angle);
}

function stopKnobDrag() {
    activeKnob = null;
    window.removeEventListener('mousemove', dragKnob);
    window.removeEventListener('mouseup', stopKnobDrag);
    window.removeEventListener('touchmove', dragKnob);
    window.removeEventListener('touchend', stopKnobDrag);
}

const originalToggleInteractivePlay = toggleInteractivePlay;
toggleInteractivePlay = function(secId) {
    initWebAudioForSection(secId);
    originalToggleInteractivePlay(secId);
};

document.addEventListener('DOMContentLoaded', () => {
    initKnobs();
    const backingAudio = document.getElementById('audio-sec1-int-backing');
    const backingBtn = document.getElementById('btn-sec1-backing');
    if (backingAudio) backingAudio.volume = 1;
    if (backingBtn) backingBtn.classList.add('active');
});

function handleValueInput(input) {
    const val = parseInt(input.value);
    if (isNaN(val)) return;

    let angle = val;
    if (angle < -90) angle = -90;
    if (angle > 90) angle = 90;

    const container = input.closest('.knob-container');
    const knob = container.querySelector('.knob');
    if (knob) {
        setKnobAngle(knob, angle, false);
    }
}

function sanitizeValueInput(input) {
    let val = parseInt(input.value);
    const container = input.closest('.knob-container');
    const knob = container.querySelector('.knob');
    
    if (isNaN(val)) val = knob ? parseInt(knob.getAttribute('data-angle')) : 0;
    if (val < -90) val = -90;
    if (val > 90) val = 90;
    input.value = val;
    if (knob) setKnobAngle(knob, val, true);
}

function toggleBackingButton(secId) {
    const backingAudio = document.getElementById(`audio-${secId}-int-backing`);
    const backingBtn = document.getElementById(`btn-${secId}-backing`);
    
    if (!backingAudio || !backingBtn) return;
    
    if (backingBtn.classList.contains('active')) {
        backingBtn.classList.remove('active');
        backingAudio.volume = 0.0;
    } else {
        backingBtn.classList.add('active');
        backingAudio.volume = 0.8; 
    }
}

function sbloccaAudioSafari() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            window.removeEventListener('click', sbloccaAudioSafari);
            window.removeEventListener('touchstart', sbloccaAudioSafari);
        });
    }
}

window.addEventListener('click', sbloccaAudioSafari);
window.addEventListener('touchstart', sbloccaAudioSafari);