// ============================================================
// ТМА МТС — Логика работы
// Карта, загрузка жалоб, статистика, переключение видов
// ============================================================

// === ИНИЦИАЛИЗАЦИЯ КАРТЫ (Leaflet) ===
const map = L.map('map', {
    center: [55.75, 37.62],
    zoom: 11,
    zoomControl: true
});

// Стиль карты (светлый, чистый)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; CartoDB'
}).addTo(map);

// Слой для маркеров
let markersLayer = L.layerGroup().addTo(map);

// === ХРАНИЛИЩЕ ДАННЫХ ===
let complaintsData = [];

// === СТАТУСЫ ===
const STATUS_LABELS = {
    'new': '🟡 Ожидает',
    'in_progress': '🔴 В работе',
    'resolved': '🟢 Решено',
    'rejected': '⚪ Отклонено'
};

const STATUS_CLASS = {
    'new': 'new',
    'in_progress': 'in_progress',
    'resolved': 'resolved',
    'rejected': 'rejected'
};

// === ЗАГРУЗКА ДАННЫХ ===
function loadData() {
    const btn = document.querySelector('.refresh-btn');
    btn.classList.add('loading');
    btn.textContent = '⟳';
    
    // Пытаемся получить данные из Telegram Web App
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData('get_complaints');
    }
    
    // Для демонстрации — загружаем тестовые данные
    setTimeout(() => {
        loadMockData();
        btn.classList.remove('loading');
        btn.textContent = '⟳';
    }, 500);
}

// === ТЕСТОВЫЕ ДАННЫЕ (ДЛЯ ДЕМОНСТРАЦИИ) ===
function loadMockData() {
    const mockData = [
        {
            id: 1,
            client_name: 'Иванов Иван',
            phone: '8-912-345-67-89',
            address: 'ул. Ленина 15, Москва',
            category: '📶 Интернет не работает',
            status: 'in_progress',
            lat: 55.7558,
            lon: 37.6173,
            created_at: '25.06.2026 10:30'
        },
        {
            id: 2,
            client_name: 'Петрова Мария',
            phone: '8-913-456-78-90',
            address: 'пр. Мира 22, Москва',
            category: '💰 Списание средств',
            status: 'new',
            lat: 55.7658,
            lon: 37.6273,
            created_at: '25.06.2026 11:15'
        },
        {
            id: 3,
            client_name: 'Сидоров Алексей',
            phone: '8-914-567-89-01',
            address: 'ул. Советская 7, Москва',
            category: '📞 Плохая связь',
            status: 'resolved',
            lat: 55.7458,
            lon: 37.6073,
            created_at: '24.06.2026 16:20'
        },
        {
            id: 4,
            client_name: 'Козлова Екатерина',
            phone: '8-915-678-90-12',
            address: 'ул. Тверская 10, Москва',
            category: '🌍 Роуминг',
            status: 'in_progress',
            lat: 55.7650,
            lon: 37.6000,
            created_at: '25.06.2026 09:00'
        },
        {
            id: 5,
            client_name: 'Морозов Дмитрий',
            phone: '8-916-789-01-23',
            address: 'ул. Арбат 35, Москва',
            category: '📱 СМС не приходят',
            status: 'new',
            lat: 55.7520,
            lon: 37.5900,
            created_at: '25.06.2026 08:45'
        },
        {
            id: 6,
            client_name: 'Волкова Анна',
            phone: '8-917-890-12-34',
            address: 'ул. Покровка 20, Москва',
            category: '📶 Интернет не работает',
            status: 'resolved',
            lat: 55.7580,
            lon: 37.6400,
            created_at: '23.06.2026 14:10'
        },
        {
            id: 7,
            client_name: 'Соколов Павел',
            phone: '8-918-901-23-45',
            address: 'ул. Бауманская 12, Москва',
            category: '💰 Списание средств',
            status: 'in_progress',
            lat: 55.7700,
            lon: 37.6800,
            created_at: '25.06.2026 12:00'
        },
        {
            id: 8,
            client_name: 'Михайлова Ольга',
            phone: '8-919-012-34-56',
            address: 'ул. Пречистенка 5, Москва',
            category: '📞 Плохая связь',
            status: 'new',
            lat: 55.7400,
            lon: 37.6000,
            created_at: '25.06.2026 13:30'
        }
    ];
    
    complaintsData = mockData;
    renderAll();
}

// === ОТОБРАЖЕНИЕ ВСЕХ ДАННЫХ ===
function renderAll() {
    updateStats();
    renderMarkers();
    renderList();
    updateBadge();
}

// === ОБНОВЛЕНИЕ СТАТИСТИКИ ===
function updateStats() {
    const total = complaintsData.length;
    const active = complaintsData.filter(c => c.status === 'in_progress').length;
    const newCount = complaintsData.filter(c => c.status === 'new').length;
    const resolved = complaintsData.filter(c => c.status === 'resolved').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('newCount').textContent = newCount;
    document.getElementById('resolvedCount').textContent = resolved;
    document.getElementById('listCount').textContent = total;
}

// === ОБНОВЛЕНИЕ БЕЙДЖА В ШАПКЕ ===
function updateBadge() {
    const active = complaintsData.filter(c => c.status === 'in_progress' || c.status === 'new').length;
    document.getElementById('complaintCount').textContent = `${active} активных`;
}

// === ОТОБРАЖЕНИЕ МАРКЕРОВ НА КАРТЕ ===
function renderMarkers() {
    markersLayer.clearLayers();
    
    complaintsData.forEach(comp => {
        if (!comp.lat || !comp.lon) return;
        
        let color = '#e60000';
        let statusLabel = 'Активна';
        
        if (comp.status === 'resolved') {
            color = '#00a859';
            statusLabel = 'Решена';
        } else if (comp.status === 'new') {
            color = '#ff8c00';
            statusLabel = 'Новая';
        } else if (comp.status === 'rejected') {
            color = '#999';
            statusLabel = 'Отклонена';
        }
        
        // Кастомная иконка
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${comp.id}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
        
        const marker = L.marker([comp.lat, comp.lon], { icon })
            .addTo(markersLayer)
            .bindPopup(`
                <div style="font-family:'Inter',sans-serif;min-width:180px;">
                    <div style="font-weight:700;font-size:15px;color:#1a1a1a;">${comp.client_name}</div>
                    <div style="font-size:13px;color:#888;">${comp.phone}</div>
                    <div style="font-size:13px;color:#555;margin-top:4px;padding:4px 8px;background:#f5f5f5;border-radius:6px;">${comp.address}</div>
                    <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:12px;font-weight:600;background:#e60000;color:white;padding:2px 12px;border-radius:12px;">${comp.category}</span>
                        <span style="font-size:12px;font-weight:500;color:${color};">● ${statusLabel}</span>
                    </div>
                    <div style="font-size:11px;color:#bbb;margin-top:4px;">${comp.created_at || ''}</div>
                </div>
            `);
    });
}

// === ОТОБРАЖЕНИЕ СПИСКА ЖАЛОБ ===
function renderList() {
    const container = document.getElementById('complaintItems');
    
    if (complaintsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <h3>Нет жалоб</h3>
                <p>Пока нет ни одной жалобы от клиентов</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    complaintsData.forEach(comp => {
        const statusClass = STATUS_CLASS[comp.status] || 'new';
        const statusLabel = STATUS_LABELS[comp.status] || comp.status;
        
        html += `
            <div class="complaint-item">
                <div class="top-row">
                    <div>
                        <div class="name">${comp.client_name}</div>
                        <div class="phone">${comp.phone}</div>
                    </div>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="address">📍 ${comp.address}</div>
                <div class="bottom-row">
                    <span class="category-tag">${comp.category}</span>
                    <span class="time">🆔 ${comp.id} • ${comp.created_at || ''}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// === ПЕРЕКЛЮЧЕНИЕ МЕЖДУ КАРТОЙ И СПИСКОМ ===
function showMap() {
    document.getElementById('complaintList').classList.remove('active');
    document.getElementById('map').style.display = 'block';
    document.getElementById('btnMap').classList.add('active');
    document.getElementById('btnList').classList.remove('active');
    // Обновляем карту
    setTimeout(() => map.invalidateSize(), 100);
}

function showList() {
    document.getElementById('complaintList').classList.add('active');
    document.getElementById('map').style.display = 'none';
    document.getElementById('btnList').classList.add('active');
    document.getElementById('btnMap').classList.remove('active');
}

// === ПОДКЛЮЧЕНИЕ К TELEGRAM WEB APP ===
function initTelegram() {
    if (window.Telegram && Telegram.WebApp) {
        const webApp = Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        
        // Обработка данных от бота
        webApp.onEvent('message', function(data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'complaints' && parsed.data) {
                    complaintsData = parsed.data;
                    renderAll();
                }
            } catch (e) {
                console.log('Ошибка парсинга данных от бота');
            }
        });
    }
}

// === ЗАГРУЗКА ПРИ СТАРТЕ ===
document.addEventListener('DOMContentLoaded', function() {
    initTelegram();
    loadData();
    
    // Обновляем карту при ресайзе
    window.addEventListener('resize', function() {
        setTimeout(() => map.invalidateSize(), 200);
    });
});

// === ОБРАБОТКА НАЖАТИЯ НА ЖАЛОБУ (ДЛЯ ДЕМОНСТРАЦИИ) ===
document.addEventListener('click', function(e) {
    const item = e.target.closest('.complaint-item');
    if (item) {
        // Можно открыть детали жалобы
        item.style.borderLeftColor = '#ff8c00';
        setTimeout(() => {
            item.style.borderLeftColor = '#e60000';
        }, 500);
    }
});

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ТЕСТИРОВАНИЯ ===
window.loadComplaints = function(data) {
    if (data && Array.isArray(data)) {
        complaintsData = data;
        renderAll();
    }
};