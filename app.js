/* ═══════════════════════════════════════════════
   macOS Clock App — JavaScript
   ═══════════════════════════════════════════════ */
(() => {
    'use strict';

    // ═══════════════════════════════════════════
    // Theme Logic
    // ═══════════════════════════════════════════
    function applyTheme() {
        if (state.theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (window.electronAPI) window.electronAPI.setTheme('dark');
        } else {
            document.body.classList.remove('dark-mode');
            if (window.electronAPI) window.electronAPI.setTheme('light');
        }
    }

    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        saveState();
        applyTheme();
    }

    // ═══════════════════════════════════════════
    // Navigation / Tabs
    // ═══════════════════════════════════════════
    const CITIES = [
        { name: 'Cupertino', country: 'USA', tz: 'America/Los_Angeles' },
        { name: 'New York', country: 'USA', tz: 'America/New_York' },
        { name: 'London', country: 'United Kingdom', tz: 'Europe/London' },
        { name: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo' },
        { name: 'Paris', country: 'France', tz: 'Europe/Paris' },
        { name: 'Berlin', country: 'Germany', tz: 'Europe/Berlin' },
        { name: 'Sydney', country: 'Australia', tz: 'Australia/Sydney' },
        { name: 'Melbourne', country: 'Australia', tz: 'Australia/Melbourne' },
        { name: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland' },
        { name: 'Hong Kong', country: 'China', tz: 'Asia/Hong_Kong' },
        { name: 'Shanghai', country: 'China', tz: 'Asia/Shanghai' },
        { name: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore' },
        { name: 'Bangkok', country: 'Thailand', tz: 'Asia/Bangkok' },
        { name: 'Mumbai', country: 'India', tz: 'Asia/Kolkata' },
        { name: 'Dubai', country: 'UAE', tz: 'Asia/Dubai' },
        { name: 'Moscow', country: 'Russia', tz: 'Europe/Moscow' },
        { name: 'Istanbul', country: 'Turkey', tz: 'Europe/Istanbul' },
        { name: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo' },
        { name: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg' },
        { name: 'Lagos', country: 'Nigeria', tz: 'Africa/Lagos' },
        { name: 'Nairobi', country: 'Kenya', tz: 'Africa/Nairobi' },
        { name: 'Toronto', country: 'Canada', tz: 'America/Toronto' },
        { name: 'Vancouver', country: 'Canada', tz: 'America/Vancouver' },
        { name: 'Chicago', country: 'USA', tz: 'America/Chicago' },
        { name: 'Denver', country: 'USA', tz: 'America/Denver' },
        { name: 'Los Angeles', country: 'USA', tz: 'America/Los_Angeles' },
        { name: 'Honolulu', country: 'USA', tz: 'Pacific/Honolulu' },
        { name: 'Anchorage', country: 'USA', tz: 'America/Anchorage' },
        { name: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo' },
        { name: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires' },
        { name: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City' },
        { name: 'Lima', country: 'Peru', tz: 'America/Lima' },
        { name: 'Reykjavik', country: 'Iceland', tz: 'Atlantic/Reykjavik' },
        { name: 'Lisbon', country: 'Portugal', tz: 'Europe/Lisbon' },
        { name: 'Madrid', country: 'Spain', tz: 'Europe/Madrid' },
        { name: 'Rome', country: 'Italy', tz: 'Europe/Rome' },
        { name: 'Amsterdam', country: 'Netherlands', tz: 'Europe/Amsterdam' },
        { name: 'Stockholm', country: 'Sweden', tz: 'Europe/Stockholm' },
        { name: 'Helsinki', country: 'Finland', tz: 'Europe/Helsinki' },
        { name: 'Warsaw', country: 'Poland', tz: 'Europe/Warsaw' },
        { name: 'Athens', country: 'Greece', tz: 'Europe/Athens' },
        { name: 'Seoul', country: 'South Korea', tz: 'Asia/Seoul' },
        { name: 'Taipei', country: 'Taiwan', tz: 'Asia/Taipei' },
        { name: 'Jakarta', country: 'Indonesia', tz: 'Asia/Jakarta' },
        { name: 'Manila', country: 'Philippines', tz: 'Asia/Manila' },
        { name: 'Riyadh', country: 'Saudi Arabia', tz: 'Asia/Riyadh' },
        { name: 'Tehran', country: 'Iran', tz: 'Asia/Tehran' },
        { name: 'Karachi', country: 'Pakistan', tz: 'Asia/Karachi' },
        { name: 'Dhaka', country: 'Bangladesh', tz: 'Asia/Dhaka' },
        { name: 'Kathmandu', country: 'Nepal', tz: 'Asia/Kathmandu' },
    ];

    const DEFAULT_CITIES = ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

    // ═══════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════
    let state = {
        activeTab: 'world-clock',
        worldClocks: [],       // Array of timezone strings
        alarms: [],            // Array of { id, hour, minute, ampm, label, repeatDays, enabled }
        stopwatch: {
            running: false,
            startTime: 0,
            elapsed: 0,
            laps: [],          // Array of { lapTime, totalTime }
            lapStart: 0,
        },
        timer: {
            running: false,
            paused: false,
            totalDuration: 0,
            remaining: 0,
            endTime: 0,
            pausedRemaining: 0,
        },
        recentTimers: [],      // Array of seconds
        lastTimerSetting: { h: 0, m: 5, s: 0 },
        pomodoro: {
            phase: 'focus', // focus, shortBreak, longBreak
            cycle: 0, // 0 to 3
            running: false,
            paused: false,
            remaining: 25 * 60,
            endTime: 0,
            settings: {
                focus: 25,
                shortBreak: 5,
                longBreak: 15
            }
        },
        theme: 'light' // 'light' or 'dark'
    };

    // ═══════════════════════════════════════════
    // Persistence
    // ═══════════════════════════════════════════
    async function loadState() {
        try {
            let saved = null;
            if (window.electronAPI) {
                saved = await window.electronAPI.loadState();
            } else {
                saved = JSON.parse(localStorage.getItem('macClockState'));
            }
            if (saved) {
                state.activeTab = saved.activeTab || 'world-clock';
                state.worldClocks = saved.worldClocks || DEFAULT_CITIES.slice();
                state.alarms = saved.alarms || [];
                state.recentTimers = saved.recentTimers || [];
                state.lastTimerSetting = saved.lastTimerSetting || { h: 0, m: 5, s: 0 };
                
                if (saved.pomodoro) {
                    state.pomodoro = saved.pomodoro;
                    // Reset running state if it was loaded (we don't persist active timers over long periods automatically yet)
                    if (state.pomodoro.running) {
                        state.pomodoro.paused = true;
                        state.pomodoro.running = false;
                        state.pomodoro.endTime = 0;
                    }
                }
                
                state.theme = saved.theme || 'light';
            } else {
                state.worldClocks = DEFAULT_CITIES.slice();
            }
        } catch (e) {
            state.worldClocks = DEFAULT_CITIES.slice();
        }
    }

    function saveState() {
        try {
            const data = {
                activeTab: state.activeTab,
                worldClocks: state.worldClocks,
                alarms: state.alarms,
                recentTimers: state.recentTimers,
                lastTimerSetting: state.lastTimerSetting,
                pomodoro: state.pomodoro,
                theme: state.theme,
            };
            if (window.electronAPI) {
                window.electronAPI.saveState(data);
            } else {
                localStorage.setItem('macClockState', JSON.stringify(data));
            }
        } catch (e) { /* ignore */ }
    }

    // ═══════════════════════════════════════════
    // Utilities
    // ═══════════════════════════════════════════
    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function getTimeInTZ(tz) {
        const now = new Date();
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false,
        }).formatToParts(now);
        const vals = {};
        parts.forEach(p => vals[p.type] = parseInt(p.value) || 0);
        return { hours: vals.hour, minutes: vals.minute, seconds: vals.second };
    }

    function getOffsetLabel(tz) {
        const now = new Date();
        const localOffset = now.getTimezoneOffset();  // in minutes, inverted
        // Get target offset
        const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
        const tzStr = now.toLocaleString('en-US', { timeZone: tz });
        const utcDate = new Date(utcStr);
        const tzDate = new Date(tzStr);
        const targetOffset = (tzDate - utcDate) / 60000; // minutes from UTC
        const localOffsetMins = -localOffset; // minutes from UTC
        const diff = targetOffset - localOffsetMins; // difference in minutes
        const diffHours = diff / 60;

        if (diff === 0) return 'Today, +0HRS';

        const sign = diff > 0 ? '+' : '';
        // Check if it's the same day
        const localDay = now.toLocaleDateString('en-US', { weekday: 'short' });
        const tzDay = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short' });
        const dayLabel = localDay === tzDay ? 'Today' : (diff > 0 ? 'Tomorrow' : 'Yesterday');

        if (Number.isInteger(diffHours)) {
            return `${dayLabel}, ${sign}${diffHours}HRS`;
        } else {
            const h = Math.floor(Math.abs(diffHours));
            const m = Math.round((Math.abs(diffHours) - h) * 60);
            const label = `${h}:${m.toString().padStart(2, '0')}`;
            return `${dayLabel}, ${sign}${diff < 0 ? '-' : ''}${label}HRS`;
        }
    }

    function getTimeString12(tz) {
        return new Date().toLocaleTimeString('en-US', {
            timeZone: tz,
            hour: 'numeric', minute: '2-digit',
            hour12: true,
        });
    }

    function isNightTime(tz) {
        const t = getTimeInTZ(tz);
        return t.hours >= 18 || t.hours < 6;
    }

    function formatStopwatch(ms) {
        const totalCs = Math.floor(ms / 10);
        const cs = totalCs % 100;
        const totalSecs = Math.floor(totalCs / 100);
        const secs = totalSecs % 60;
        const mins = Math.floor(totalSecs / 60);
        return {
            main: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            cs: `.${cs.toString().padStart(2, '0')}`,
        };
    }

    function formatTimer(seconds) {
        if (seconds <= 0) return '0:00';
        const s = Math.ceil(seconds);
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ═══════════════════════════════════════════
    // Tab Switching
    // ═══════════════════════════════════════════
    function initTabs() {
        const segments = $$('.segment');
        const segBg = $('#segment-bg');
        const addBtn = $('#add-btn');

        function updateSegBg() {
            const active = $(`.segment.active`);
            if (active && segBg) {
                segBg.style.width = active.offsetWidth + 'px';
                segBg.style.transform = `translateX(${active.offsetLeft - 2}px)`;
            }
        }

        segments.forEach(seg => {
            seg.addEventListener('click', () => {
                const tab = seg.dataset.tab;
                if (tab === state.activeTab) return;

                segments.forEach(s => s.classList.remove('active'));
                seg.classList.add('active');

                $$('.tab').forEach(t => t.classList.remove('active'));
                $(`#${tab}-tab`).classList.add('active');

                state.activeTab = tab;
                saveState();
                updateSegBg();

                // Show/hide add button
                addBtn.classList.toggle('hidden', tab !== 'world-clock' && tab !== 'alarm');
            });
        });

        // Add button handler
        addBtn.addEventListener('click', () => {
            if (state.activeTab === 'world-clock') {
                openCityModal();
            } else if (state.activeTab === 'alarm') {
                openAlarmModal();
            }
        });

        // Restore last active tab
        const savedTab = state.activeTab || 'world-clock';
        const savedSeg = Array.from(segments).find(s => s.dataset.tab === savedTab);
        if (savedSeg && savedTab !== 'world-clock') {
            segments.forEach(s => s.classList.remove('active'));
            savedSeg.classList.add('active');
            $$('.tab').forEach(t => t.classList.remove('active'));
            $(`#${savedTab}-tab`).classList.add('active');
            addBtn.classList.toggle('hidden', savedTab !== 'world-clock' && savedTab !== 'alarm');
        }

        // Initial position
        requestAnimationFrame(() => {
            updateSegBg();
            window.addEventListener('resize', updateSegBg);
        });
    }

    // ═══════════════════════════════════════════
    // World Clock
    // ═══════════════════════════════════════════
    function renderWorldClocks() {
        const grid = $('#clock-grid');
        const empty = $('#world-empty');

        if (state.worldClocks.length === 0) {
            grid.style.display = 'none';
            empty.style.display = 'flex';
            return;
        }
        grid.style.display = 'grid';
        empty.style.display = 'none';

        grid.innerHTML = state.worldClocks.map((tz, i) => {
            const city = CITIES.find(c => c.tz === tz);
            const cityName = city ? city.name : tz.split('/').pop().replace(/_/g, ' ');
            const night = isNightTime(tz);
            const dayClass = night ? 'night' : 'day';

            return `
                <div class="clock-cell" data-tz="${tz}">
                    <button class="delete-city" data-index="${i}" title="Remove">&times;</button>
                    <div class="mini-clock ${dayClass}" data-tz="${tz}">
                        ${createClockMarkers()}
                        <div class="clock-hand hour-hand" data-hand="hour"></div>
                        <div class="clock-hand minute-hand" data-hand="minute"></div>
                        <div class="clock-hand second-hand" data-hand="second"></div>
                        <div class="clock-center-dot"></div>
                    </div>
                    <div class="clock-offset">${getOffsetLabel(tz)}</div>
                    <div class="clock-city-name">${cityName}</div>
                    <div class="clock-time-text">${getTimeString12(tz)}</div>
                </div>
            `;
        }).join('');

        // Delete buttons
        grid.querySelectorAll('.delete-city').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                state.worldClocks.splice(idx, 1);
                saveState();
                renderWorldClocks();
            });
        });
    }

    function createClockMarkers() {
        let html = '';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * 360;
            const r = 46; // radius for marker positioning
            const markerR = 42;
            html += `<div class="clock-marker hour-marker" style="transform: translate(-50%, 0) rotate(${angle}deg) translateY(-${markerR}px)"></div>`;
        }
        return html;
    }

    function updateWorldClockHands() {
        $$('.mini-clock').forEach(clock => {
            const tz = clock.dataset.tz;
            const t = getTimeInTZ(tz);

            const secondAngle = t.seconds * 6;
            const minuteAngle = t.minutes * 6 + t.seconds * 0.1;
            const hourAngle = (t.hours % 12) * 30 + t.minutes * 0.5;

            const hourHand = clock.querySelector('[data-hand="hour"]');
            const minuteHand = clock.querySelector('[data-hand="minute"]');
            const secondHand = clock.querySelector('[data-hand="second"]');

            if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
            if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;
        });

        // Update time text
        $$('.clock-cell').forEach(cell => {
            const tz = cell.dataset.tz;
            if (tz) {
                const timeText = cell.querySelector('.clock-time-text');
                if (timeText) timeText.textContent = getTimeString12(tz);
            }
        });
    }

    // ── City Modal ──
    function openCityModal() {
        const modal = $('#add-city-modal');
        const input = $('#city-search');
        const list = $('#city-list');

        modal.classList.add('visible');
        input.value = '';
        input.focus();

        renderCityList('');

        input.oninput = () => renderCityList(input.value);
    }

    function closeCityModal() {
        $('#add-city-modal').classList.remove('visible');
    }

    function renderCityList(filter) {
        const list = $('#city-list');
        const lower = filter.toLowerCase();
        const available = CITIES.filter(c =>
            !state.worldClocks.includes(c.tz) &&
            (c.name.toLowerCase().includes(lower) || c.country.toLowerCase().includes(lower))
        );

        list.innerHTML = available.map(c => `
            <div class="modal-list-item" data-tz="${c.tz}">
                <div>
                    <div class="modal-list-item-city">${c.name}</div>
                    <div class="modal-list-item-tz">${c.country}</div>
                </div>
            </div>
        `).join('');

        list.querySelectorAll('.modal-list-item').forEach(item => {
            item.addEventListener('click', () => {
                state.worldClocks.push(item.dataset.tz);
                saveState();
                renderWorldClocks();
                closeCityModal();
            });
        });
    }

    // ═══════════════════════════════════════════
    // Alarms
    // ═══════════════════════════════════════════
    function renderAlarms() {
        const list = $('#alarm-list');
        const empty = $('#alarm-empty');

        if (state.alarms.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'flex';
            return;
        }
        list.style.display = 'block';
        empty.style.display = 'none';

        list.innerHTML = state.alarms.map((alarm, i) => {
            const disabledClass = alarm.enabled ? '' : 'disabled';
            const hour12 = alarm.hour > 12 ? alarm.hour - 12 : (alarm.hour === 0 ? 12 : alarm.hour);
            const ampm = alarm.hour >= 12 ? 'PM' : 'AM';
            const timeStr = `${hour12}:${alarm.minute.toString().padStart(2, '0')}`;
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            let repeatStr = '';
            if (alarm.repeatDays && alarm.repeatDays.length > 0) {
                if (alarm.repeatDays.length === 7) repeatStr = 'Every day';
                else if (arraysEqual(alarm.repeatDays.sort(), [1,2,3,4,5])) repeatStr = 'Weekdays';
                else if (arraysEqual(alarm.repeatDays.sort(), [0,6])) repeatStr = 'Weekends';
                else repeatStr = alarm.repeatDays.map(d => days[d]).join(', ');
            }

            return `
                <div class="alarm-item ${disabledClass}" data-index="${i}">
                    <div class="alarm-info">
                        <div class="alarm-time-display">
                            ${timeStr}<span class="alarm-ampm">${ampm}</span>
                        </div>
                        <div class="alarm-meta">
                            <span>${alarm.label || 'Alarm'}</span>
                            ${repeatStr ? `<span class="alarm-dot"></span><span>${repeatStr}</span>` : ''}
                        </div>
                    </div>
                    <div class="alarm-actions">
                        <button class="alarm-delete-btn" data-index="${i}" title="Delete">&times;</button>
                        <div class="toggle ${alarm.enabled ? 'on' : ''}" data-index="${i}">
                            <div class="toggle-knob"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Toggle handlers
        list.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const idx = parseInt(toggle.dataset.index);
                state.alarms[idx].enabled = !state.alarms[idx].enabled;
                saveState();
                renderAlarms();
            });
        });

        // Delete handlers
        list.querySelectorAll('.alarm-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                state.alarms.splice(idx, 1);
                saveState();
                renderAlarms();
            });
        });
    }

    function arraysEqual(a, b) {
        return a.length === b.length && a.every((v, i) => v === b[i]);
    }

    // ── Alarm Modal ──
    let alarmPickerHours, alarmPickerMinutes, alarmPickerAmpm;

    function openAlarmModal() {
        const modal = $('#add-alarm-modal');
        modal.classList.add('visible');

        // Reset fields
        $('#alarm-label').value = 'Alarm';
        $$('#alarm-repeat-days .day-pill').forEach(p => p.classList.remove('active'));

        // Initialize pickers
        if (!alarmPickerHours) {
            alarmPickerHours = createPicker('#alarm-picker-hours', Array.from({length: 12}, (_, i) => i + 1), 12);
            alarmPickerMinutes = createPicker('#alarm-picker-minutes', Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')), 0);
            alarmPickerAmpm = createPicker('#alarm-picker-ampm', ['AM', 'PM'], 0);
        }

        // Set to current time
        const now = new Date();
        let h = now.getHours();
        const ampmIdx = h >= 12 ? 1 : 0;
        h = h % 12 || 12;
        alarmPickerHours.scrollToIndex(h - 1);
        alarmPickerMinutes.scrollToIndex(now.getMinutes());
        alarmPickerAmpm.scrollToIndex(ampmIdx);

        // Day pill handlers
        $$('#alarm-repeat-days .day-pill').forEach(pill => {
            pill.onclick = () => pill.classList.toggle('active');
        });
    }

    function closeAlarmModal() {
        $('#add-alarm-modal').classList.remove('visible');
    }

    function saveAlarm() {
        const hourVal = alarmPickerHours.getValue();
        const minuteVal = parseInt(alarmPickerMinutes.getValue());
        const ampmVal = alarmPickerAmpm.getValue();

        let hour24 = parseInt(hourVal);
        if (ampmVal === 'PM' && hour24 !== 12) hour24 += 12;
        if (ampmVal === 'AM' && hour24 === 12) hour24 = 0;

        const repeatDays = [];
        $$('#alarm-repeat-days .day-pill.active').forEach(p => {
            repeatDays.push(parseInt(p.dataset.day));
        });

        state.alarms.push({
            id: Date.now(),
            hour: hour24,
            minute: minuteVal,
            label: $('#alarm-label').value || 'Alarm',
            repeatDays,
            enabled: true,
        });

        // Sort alarms by time
        state.alarms.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

        saveState();
        renderAlarms();
        closeAlarmModal();
    }

    // ═══════════════════════════════════════════
    // Stopwatch
    // ═══════════════════════════════════════════
    let swAnimFrame;

    function initStopwatch() {
        const leftBtn = $('#sw-left-btn');
        const rightBtn = $('#sw-right-btn');

        rightBtn.addEventListener('click', () => {
            if (state.stopwatch.running) {
                // Stop
                state.stopwatch.elapsed += performance.now() - state.stopwatch.startTime;
                state.stopwatch.running = false;
                cancelAnimationFrame(swAnimFrame);
                updateSwButtons();
            } else {
                // Start
                state.stopwatch.startTime = performance.now();
                state.stopwatch.running = true;
                if (state.stopwatch.laps.length === 0) {
                    state.stopwatch.lapStart = state.stopwatch.elapsed;
                }
                updateSwButtons();
                tickStopwatch();
            }
        });

        leftBtn.addEventListener('click', () => {
            if (state.stopwatch.running) {
                // Lap
                const totalElapsed = state.stopwatch.elapsed + (performance.now() - state.stopwatch.startTime);
                const lapTime = totalElapsed - state.stopwatch.lapStart;
                state.stopwatch.laps.unshift({ lapTime, totalTime: totalElapsed });
                state.stopwatch.lapStart = totalElapsed;
                renderLaps();
            } else if (state.stopwatch.elapsed > 0) {
                // Reset
                state.stopwatch.elapsed = 0;
                state.stopwatch.laps = [];
                state.stopwatch.lapStart = 0;
                updateSwDisplay(0);
                renderLaps();
                updateSwButtons();
            }
        });
    }

    function tickStopwatch() {
        if (!state.stopwatch.running) return;
        const elapsed = state.stopwatch.elapsed + (performance.now() - state.stopwatch.startTime);
        updateSwDisplay(elapsed);
        swAnimFrame = requestAnimationFrame(tickStopwatch);
    }

    function updateSwDisplay(ms) {
        const f = formatStopwatch(ms);
        const el = $('#stopwatch-time');
        el.innerHTML = `${f.main}<span class="stopwatch-cs">${f.cs}</span>`;
    }

    function updateSwButtons() {
        const leftBtn = $('#sw-left-btn');
        const rightBtn = $('#sw-right-btn');

        if (state.stopwatch.running) {
            rightBtn.className = 'round-btn round-btn--red';
            rightBtn.querySelector('span').textContent = 'Stop';
            leftBtn.className = 'round-btn round-btn--gray';
            leftBtn.querySelector('span').textContent = 'Lap';
        } else if (state.stopwatch.elapsed > 0) {
            rightBtn.className = 'round-btn round-btn--green';
            rightBtn.querySelector('span').textContent = 'Start';
            leftBtn.className = 'round-btn round-btn--gray';
            leftBtn.querySelector('span').textContent = 'Reset';
        } else {
            rightBtn.className = 'round-btn round-btn--green';
            rightBtn.querySelector('span').textContent = 'Start';
            leftBtn.className = 'round-btn round-btn--gray disabled';
            leftBtn.querySelector('span').textContent = 'Reset';
        }
    }

    function renderLaps() {
        const tbody = $('#lap-tbody');
        if (state.stopwatch.laps.length === 0) {
            tbody.innerHTML = '';
            return;
        }

        // Find fastest and slowest laps (only if >1)
        let fastestIdx = -1, slowestIdx = -1;
        if (state.stopwatch.laps.length > 1) {
            let min = Infinity, max = 0;
            state.stopwatch.laps.forEach((lap, i) => {
                if (lap.lapTime < min) { min = lap.lapTime; fastestIdx = i; }
                if (lap.lapTime > max) { max = lap.lapTime; slowestIdx = i; }
            });
        }

        const totalLaps = state.stopwatch.laps.length;
        tbody.innerHTML = state.stopwatch.laps.map((lap, i) => {
            const lapNum = totalLaps - i;
            const lapF = formatStopwatch(lap.lapTime);
            let cls = '';
            if (i === fastestIdx) cls = 'fastest';
            if (i === slowestIdx) cls = 'slowest';
            return `<tr class="${cls}"><td>Lap ${lapNum}</td><td>${lapF.main}${lapF.cs}</td></tr>`;
        }).join('');
    }

    // ═══════════════════════════════════════════
    // Timer
    // ═══════════════════════════════════════════
    let timerPickerH, timerPickerM, timerPickerS;
    let timerAnimFrame;
    const CIRCUMFERENCE = 2 * Math.PI * 90; // r=90 from SVG

    function initTimer() {
        function onPickerChange() {
            const h = parseInt(timerPickerH.getValue()) || 0;
            const m = parseInt(timerPickerM.getValue()) || 0;
            const s = parseInt(timerPickerS.getValue()) || 0;
            state.lastTimerSetting = { h, m, s };
            saveState();
        }

        // Initialize picker columns
        timerPickerH = createPicker('#picker-hours', Array.from({length: 24}, (_, i) => i), 0, onPickerChange);
        timerPickerM = createPicker('#picker-minutes', Array.from({length: 60}, (_, i) => i), 0, onPickerChange);
        timerPickerS = createPicker('#picker-seconds', Array.from({length: 60}, (_, i) => i), 0, onPickerChange);

        // Restore last timer setting
        const last = state.lastTimerSetting || { h: 0, m: 5, s: 0 };
        timerPickerH.scrollToIndex(last.h);
        timerPickerM.scrollToIndex(last.m);
        timerPickerS.scrollToIndex(last.s);

        // Start button
        $('#timer-start-btn').addEventListener('click', startTimer);
        $('#timer-cancel-btn').addEventListener('click', () => {/* noop in picker state */});

        // Running state buttons
        $('#timer-cancel-btn-2').addEventListener('click', cancelTimer);
        $('#timer-pause-btn').addEventListener('click', togglePauseTimer);

        // Set ring circumference
        const ring = $('#timer-ring-progress');
        ring.style.strokeDasharray = CIRCUMFERENCE;
        ring.style.strokeDashoffset = '0';

        renderRecentTimers();
    }

    function startTimer() {
        const h = parseInt(timerPickerH.getValue()) || 0;
        const m = parseInt(timerPickerM.getValue()) || 0;
        const s = parseInt(timerPickerS.getValue()) || 0;
        const totalSec = h * 3600 + m * 60 + s;

        if (totalSec === 0) return;

        // Save last timer picker setting
        state.lastTimerSetting = { h, m, s };

        // Save to recent
        if (!state.recentTimers.includes(totalSec)) {
            state.recentTimers.unshift(totalSec);
            if (state.recentTimers.length > 5) state.recentTimers.pop();
        }
        saveState();

        state.timer.totalDuration = totalSec;
        state.timer.remaining = totalSec;
        state.timer.endTime = Date.now() + totalSec * 1000;
        state.timer.running = true;
        state.timer.paused = false;

        showTimerRunning(true);
        tickTimer();
    }

    function startTimerFromRecent(totalSec) {
        state.timer.totalDuration = totalSec;
        state.timer.remaining = totalSec;
        state.timer.endTime = Date.now() + totalSec * 1000;
        state.timer.running = true;
        state.timer.paused = false;

        showTimerRunning(true);
        tickTimer();
    }

    function cancelTimer() {
        state.timer.running = false;
        state.timer.paused = false;
        cancelAnimationFrame(timerAnimFrame);
        showTimerRunning(false);
        renderRecentTimers();
    }

    function togglePauseTimer() {
        const btn = $('#timer-pause-btn');
        if (state.timer.paused) {
            // Resume
            state.timer.paused = false;
            state.timer.endTime = Date.now() + state.timer.pausedRemaining * 1000;
            btn.className = 'round-btn round-btn--orange';
            btn.querySelector('span').textContent = 'Pause';
            tickTimer();
        } else {
            // Pause
            state.timer.paused = true;
            state.timer.pausedRemaining = state.timer.remaining;
            cancelAnimationFrame(timerAnimFrame);
            btn.className = 'round-btn round-btn--green';
            btn.querySelector('span').textContent = 'Resume';
        }
    }

    function tickTimer() {
        if (!state.timer.running || state.timer.paused) return;

        const now = Date.now();
        const remaining = Math.max(0, (state.timer.endTime - now) / 1000);
        state.timer.remaining = remaining;

        // Update display
        $('#timer-remaining').textContent = formatTimer(remaining);

        // Update ring
        const progress = remaining / state.timer.totalDuration;
        const offset = CIRCUMFERENCE * (1 - progress);
        $('#timer-ring-progress').style.strokeDashoffset = offset;

        if (remaining <= 0) {
            // Timer finished
            state.timer.running = false;
            playTimerSound();
            setTimeout(() => {
                cancelTimer();
            }, 3000);
            return;
        }

        timerAnimFrame = requestAnimationFrame(tickTimer);
    }

    function showTimerRunning(show) {
        $('#timer-picker-state').style.display = show ? 'none' : 'flex';
        $('#timer-running-state').style.display = show ? 'flex' : 'none';

        if (show) {
            const btn = $('#timer-pause-btn');
            btn.className = 'round-btn round-btn--orange';
            btn.querySelector('span').textContent = 'Pause';
        }
    }

    function renderRecentTimers() {
        const container = $('#recent-timers');
        if (state.recentTimers.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="recent-timers-header">Recents</div>
            ${state.recentTimers.map((sec, i) => {
                const label = formatTimer(sec);
                return `
                    <div class="recent-timer-item" data-seconds="${sec}" data-index="${i}">
                        <div class="recent-timer-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <span class="recent-timer-text">${label}</span>
                        <button class="recent-timer-delete" data-index="${i}">&times;</button>
                    </div>
                `;
            }).join('')}
        `;

        container.querySelectorAll('.recent-timer-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.recent-timer-delete')) return;
                startTimerFromRecent(parseInt(item.dataset.seconds));
            });
        });

        container.querySelectorAll('.recent-timer-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                state.recentTimers.splice(parseInt(btn.dataset.index), 1);
                saveState();
                renderRecentTimers();
            });
        });
    }

    // ═══════════════════════════════════════════
    // Scroll Picker Component
    // ═══════════════════════════════════════════
    function createPicker(selector, values, defaultIndex, onChange) {
        const container = document.querySelector(selector);
        const ITEM_HEIGHT = 36;
        const VISIBLE = 5;

        container.innerHTML = `
            <div class="picker-highlight"></div>
            <div class="picker-scroll">
                <div class="picker-spacer"></div>
                ${values.map((v, i) => `<div class="picker-item" data-index="${i}" data-value="${v}">${v}</div>`).join('')}
                <div class="picker-spacer"></div>
            </div>
        `;

        const scroll = container.querySelector('.picker-scroll');
        let selectedIndex = defaultIndex;

        function scrollToIndex(idx, smooth) {
            selectedIndex = Math.max(0, Math.min(values.length - 1, idx));
            const top = selectedIndex * ITEM_HEIGHT;
            scroll.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
        }

        function getSelectedIndex() {
            return Math.round(scroll.scrollTop / ITEM_HEIGHT);
        }

        // Custom wheel handler for smooth 1-by-1 scrolling
        let wheelAccumulator = 0;
        scroll.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 33; // DOM_DELTA_LINE
            
            wheelAccumulator += delta;
            
            // 90 is a good threshold: standard Windows wheel tick is 100
            // This ensures 1 wheel tick = 1 item scroll
            const threshold = 90;
            if (Math.abs(wheelAccumulator) >= threshold) {
                const steps = Math.trunc(wheelAccumulator / threshold);
                wheelAccumulator -= steps * threshold; // keep remainder
                
                scrollToIndex(selectedIndex + steps, true);
            }
        }, { passive: false });

        // Debounced scroll end
        let scrollTimer;
        scroll.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const oldIndex = selectedIndex;
                selectedIndex = getSelectedIndex();
                scrollToIndex(selectedIndex, true);
                if (oldIndex !== selectedIndex && onChange) {
                    onChange();
                }
            }, 80);
        });

        // Click to select
        container.querySelectorAll('.picker-item').forEach(item => {
            item.addEventListener('click', () => {
                scrollToIndex(parseInt(item.dataset.index), true);
            });
        });

        // Initial scroll
        requestAnimationFrame(() => scrollToIndex(defaultIndex, false));

        return {
            getValue: () => {
                const idx = getSelectedIndex();
                return values[Math.max(0, Math.min(values.length - 1, idx))];
            },
            scrollToIndex: (idx) => {
                requestAnimationFrame(() => scrollToIndex(idx, false));
            },
        };
    }

    // ═══════════════════════════════════════════
    // Audio
    // ═══════════════════════════════════════════
    let audioCtx;

    function playTimerSound() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Play a gentle chime pattern
        const times = [0, 0.3, 0.6, 1.2, 1.5, 1.8];
        const freqs = [880, 1047, 1319, 880, 1047, 1319];

        times.forEach((t, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freqs[i];
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.25);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + t);
            osc.stop(audioCtx.currentTime + t + 0.3);
        });
    }

    // ═══════════════════════════════════════════
    // Alarm Checking
    // ═══════════════════════════════════════════
    let lastAlarmMinute = -1;

    function checkAlarms() {
        const now = new Date();
        const currentMinute = now.getHours() * 60 + now.getMinutes();

        if (currentMinute === lastAlarmMinute) return;
        lastAlarmMinute = currentMinute;

        state.alarms.forEach(alarm => {
            if (!alarm.enabled) return;
            const alarmMinute = alarm.hour * 60 + alarm.minute;
            if (alarmMinute === currentMinute) {
                // Check repeat days
                if (alarm.repeatDays && alarm.repeatDays.length > 0) {
                    if (!alarm.repeatDays.includes(now.getDay())) return;
                }
                playTimerSound();
                // Visual notification
                const label = alarm.label || 'Alarm';
                if (Notification.permission === 'granted') {
                    new Notification('Clock', { body: label });
                }
            }
        });
    }

    // ═══════════════════════════════════════════
    // Modal Close Handlers
    // ═══════════════════════════════════════════
    function initModals() {
        // City modal
        $('#close-city-modal').addEventListener('click', closeCityModal);
        $('#add-city-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeCityModal();
        });

        // Alarm modale
        const alarmModal = $('#alarm-modal');
        $('#alarm-cancel-btn').addEventListener('click', () => alarmModal.style.display = 'none');
        $('#alarm-save-btn').addEventListener('click', saveAlarm);

        // Pomodoro Settings modal
        const pomoModal = $('#pomodoro-modal');
        $('#pomodoro-settings-btn').addEventListener('click', () => {
            $('#pomo-focus-input').value = state.pomodoro.settings.focus;
            $('#pomo-short-input').value = state.pomodoro.settings.shortBreak;
            $('#pomo-long-input').value = state.pomodoro.settings.longBreak;
            pomoModal.style.display = 'flex';
        });
        
        $('#pomo-cancel-btn').addEventListener('click', () => pomoModal.style.display = 'none');
        
        $('#pomo-save-btn').addEventListener('click', () => {
            const focus = parseInt($('#pomo-focus-input').value) || 25;
            const short = parseInt($('#pomo-short-input').value) || 5;
            const long = parseInt($('#pomo-long-input').value) || 15;
            
            state.pomodoro.settings = { focus, shortBreak: short, longBreak: long };
            saveState();
            
            // If not running, reset timer to new setting
            if (!state.pomodoro.running && !state.pomodoro.paused) {
                resetPomodoroPhase(state.pomodoro.phase);
            }
            
            pomoModal.style.display = 'none';
        });

        // Preset buttons
        $$('#pomodoro-preset-control .segment').forEach(seg => {
            seg.addEventListener('click', () => {
                $$('#pomodoro-preset-control .segment').forEach(s => s.classList.remove('active'));
                seg.classList.add('active');
                
                const preset = seg.dataset.preset;
                if (preset === 'classic') {
                    $('#pomo-focus-input').value = 25;
                    $('#pomo-short-input').value = 5;
                    $('#pomo-long-input').value = 15;
                } else if (preset === 'long') {
                    $('#pomo-focus-input').value = 50;
                    $('#pomo-short-input').value = 10;
                    $('#pomo-long-input').value = 30;
                }
            });
        });
        });

        // Alarm modal
        $('#add-alarm-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) alarmModal.style.display = 'none';
        });

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCityModal();
                alarmModal.style.display = 'none';
                pomoModal.style.display = 'none';
            }
        });
    }

    // ═══════════════════════════════════════════
    // Pomodoro Component
    // ═══════════════════════════════════════════
    let pomodoroAnimFrame;
    const POMO_CIRCUMFERENCE = 2 * Math.PI * 90;

    function initPomodoro() {
        const ring = $('#pomodoro-ring-progress');
        ring.style.strokeDasharray = POMO_CIRCUMFERENCE;
        ring.style.strokeDashoffset = '0';
        
        $('#pomodoro-start-btn').addEventListener('click', togglePomodoro);
        $('#pomodoro-skip-btn').addEventListener('click', skipPomodoroPhase);
        
        // Restore from loaded state
        if (state.pomodoro.running || state.pomodoro.paused) {
            updatePomodoroUI();
            if (state.pomodoro.running) tickPomodoro();
        } else {
            resetPomodoroPhase(state.pomodoro.phase);
        }
    }

    function togglePomodoro() {
        if (!state.pomodoro.running && !state.pomodoro.paused) {
            // Start fresh
            state.pomodoro.running = true;
            state.pomodoro.endTime = Date.now() + state.pomodoro.remaining * 1000;
            saveState();
            updatePomodoroUI();
            tickPomodoro();
        } else if (state.pomodoro.running) {
            // Pause
            state.pomodoro.paused = true;
            state.pomodoro.running = false;
            cancelAnimationFrame(pomodoroAnimFrame);
            saveState();
            updatePomodoroUI();
        } else {
            // Resume
            state.pomodoro.paused = false;
            state.pomodoro.running = true;
            state.pomodoro.endTime = Date.now() + state.pomodoro.remaining * 1000;
            saveState();
            updatePomodoroUI();
            tickPomodoro();
        }
    }

    function skipPomodoroPhase() {
        cancelAnimationFrame(pomodoroAnimFrame);
        advancePomodoroPhase();
    }

    function advancePomodoroPhase() {
        let p = state.pomodoro;
        
        if (p.phase === 'focus') {
            p.cycle++;
            if (p.cycle >= 4) {
                p.phase = 'longBreak';
                p.cycle = 0;
            } else {
                p.phase = 'shortBreak';
            }
        } else {
            p.phase = 'focus';
        }
        
        resetPomodoroPhase(p.phase);
    }

    function resetPomodoroPhase(phase) {
        state.pomodoro.phase = phase;
        state.pomodoro.running = false;
        state.pomodoro.paused = false;
        cancelAnimationFrame(pomodoroAnimFrame);
        
        const settings = state.pomodoro.settings;
        if (phase === 'focus') state.pomodoro.remaining = settings.focus * 60;
        else if (phase === 'shortBreak') state.pomodoro.remaining = settings.shortBreak * 60;
        else state.pomodoro.remaining = settings.longBreak * 60;
        
        saveState();
        updatePomodoroUI();
    }

    function tickPomodoro() {
        if (!state.pomodoro.running) return;

        const now = Date.now();
        const remaining = Math.max(0, (state.pomodoro.endTime - now) / 1000);
        state.pomodoro.remaining = remaining;

        // Visual updates
        $('#pomodoro-remaining').textContent = formatTimer(remaining);
        
        const settings = state.pomodoro.settings;
        let total = settings.focus * 60;
        if (state.pomodoro.phase === 'shortBreak') total = settings.shortBreak * 60;
        if (state.pomodoro.phase === 'longBreak') total = settings.longBreak * 60;

        const progress = remaining / total;
        $('#pomodoro-ring-progress').style.strokeDashoffset = POMO_CIRCUMFERENCE * (1 - progress);

        if (remaining <= 0) {
            playTimerSound();
            advancePomodoroPhase();
            return;
        }

        pomodoroAnimFrame = requestAnimationFrame(tickPomodoro);
    }

    function updatePomodoroUI() {
        const p = state.pomodoro;
        const ring = $('#pomodoro-ring-progress');
        const phaseLabel = $('#pomodoro-phase-label');
        
        // Update labels and colors
        if (p.phase === 'focus') {
            phaseLabel.textContent = 'Focus';
            ring.style.stroke = 'var(--accent-orange)';
        } else if (p.phase === 'shortBreak') {
            phaseLabel.textContent = 'Short Break';
            ring.style.stroke = 'var(--accent-green)';
        } else {
            phaseLabel.textContent = 'Long Break';
            ring.style.stroke = 'var(--accent-blue)';
        }

        // Setup dots
        const dots = $$('#pomodoro-cycles .cycle-dot');
        dots.forEach((dot, i) => {
            if (i < p.cycle) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        // Time and ring position
        $('#pomodoro-remaining').textContent = formatTimer(p.remaining);
        
        let total = p.settings.focus * 60;
        if (p.phase === 'shortBreak') total = p.settings.shortBreak * 60;
        if (p.phase === 'longBreak') total = p.settings.longBreak * 60;
        
        if (!p.running && !p.paused) {
            ring.style.strokeDashoffset = 0;
        } else {
            const progress = p.remaining / total;
            ring.style.strokeDashoffset = POMO_CIRCUMFERENCE * (1 - progress);
        }

        // Buttons
        const startBtn = $('#pomodoro-start-btn');
        if (p.running) {
            startBtn.className = 'round-btn round-btn--orange';
            startBtn.querySelector('span').textContent = 'Pause';
        } else if (p.paused) {
            startBtn.className = 'round-btn round-btn--green';
            startBtn.querySelector('span').textContent = 'Resume';
        } else {
            startBtn.className = 'round-btn round-btn--green';
            startBtn.querySelector('span').textContent = 'Start';
        }
    }

    // ═══════════════════════════════════════════
    // Main Update Loop
    // ═══════════════════════════════════════════
    function tick() {
        updateWorldClockHands();
        checkAlarms();
    }

    // ═══════════════════════════════════════════
    // Initialization
    // ═══════════════════════════════════════════
    async function init() {
        await loadState();
        applyTheme();
        
        // Theme toggle listener
        $('#theme-btn').addEventListener('click', toggleTheme);

        initTabs();
        initModals();
        initStopwatch();
        initTimer();
        initPomodoro();

        renderWorldClocks();
        renderAlarms();

        // Start clock update interval
        tick();
        setInterval(tick, 1000);

        // Re-render world clocks every minute (for offset labels)
        setInterval(() => renderWorldClocks(), 60000);

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
