// ============================================================
// ТМА МТС — Логика работы (Уфа)
// Карта, загрузка жалоб, статистика, переключение видов
// ============================================================

// === ИНИЦИАЛИЗАЦИЯ КАРТЫ (Уфа) ===
const map = L.map('map', {
    center: [54.7355, 55.9919],  // Уфа
    zoom: 12,
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
    'in_progress': '🔵 В работе',
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

// === ТЕСТОВЫЕ ДАННЫЕ (Уфа, 20+ жалоб) ===
function loadMockData() {
    const mockData = [
        // ===== ЦЕНТР УФЫ =====
        {
            id: 1,
            client_name: 'Иванов Иван',
            phone: '8-912-345-67-89',
            address: 'ул. Ленина 15, Уфа',
            category: '📶 Интернет не работает',
            status: 'in_progress',
            lat: 54.7355,
            lon: 55.9919,
            created_at: '25.06.2026 10:30'
        },
        {
            id: 2,
            client_name: 'Петрова Мария',
            phone: '8-913-456-78-90',
            address: 'пр. Октября 22, Уфа',
            category: '💰 Списание средств',
            status: 'new',
            lat: 54.7400,
            lon: 55.9800,
            created_at: '25.06.2026 11:15'
        },
        {
            id: 3,
            client_name: 'Сидоров Алексей',
            phone: '8-914-567-89-01',
            address: 'ул. Коммунистическая 7, Уфа',
            category: '📞 Плохая связь',
            status: 'resolved',
            lat: 54.7300,
            lon: 55.9950,
            created_at: '24.06.2026 16:20'
        },
        {
            id: 4,
            client_name: 'Козлова Екатерина',
            phone: '8-915-678-90-12',
            address: 'ул. Цюрупы 10, Уфа',
            category: '🌍 Роуминг',
            status: 'in_progress',
            lat: 54.7380,
            lon: 55.9850,
            created_at: '25.06.2026 09:00'
        },
        {
            id: 5,
            client_name: 'Морозов Дмитрий',
            phone: '8-916-789-01-23',
            address: 'ул. Кирова 35, Уфа',
            category: '📱 СМС не приходят',
            status: 'new',
            lat: 54.7320,
            lon: 55.9880,
            created_at: '25.06.2026 08:45'
        },
        // ===== СЕВЕР УФЫ =====
        {
            id: 6,
            client_name: 'Волкова Анна',
            phone: '8-917-890-12-34',
            address: 'ул. Рихарда Зорге 20, Уфа',
            category: '📶 Интернет не работает',
            status: 'resolved',
            lat: 54.7500,
            lon: 55.9700,
            created_at: '23.06.2026 14:10'
        },
        {
            id: 7,
            client_name: 'Соколов Павел',
            phone: '8-918-901-23-45',
            address: 'ул. Свердлова 12, Уфа',
            category: '💰 Списание средств',
            status: 'in_progress',
            lat: 54.7550,
            lon: 55.9800,
            created_at: '25.06.2026 12:00'
        },
        {
            id: 8,
            client_name: 'Михайлова Ольга',
            phone: '8-919-012-34-56',
            address: 'ул. Пушкина 5, Уфа',
            category: '📞 Плохая связь',
            status: 'new',
            lat: 54.7450,
            lon: 55.9750,
            created_at: '25.06.2026 13:30'
        },
        // ===== ЮГ УФЫ =====
        {
            id: 9,
            client_name: 'Алексеев Сергей',
            phone: '8-920-123-45-67',
            address: 'ул. Юрия Гагарина 8, Уфа',
            category: '📶 Интернет не работает',
            status: 'in_progress',
            lat: 54.7200,
            lon: 55.9900,
            created_at: '24.06.2026 18:00'
        },
        {
            id: 10,
            client_name: 'Дмитриева Елена',
            phone: '8-921-234-56-78',
            address: 'ул. 50 лет СССР 15, Уфа',
            category: '📞 Плохая связь',
            status: 'new',
            lat: 54.7250,
            lon: 55.9850,
            created_at: '25.06.2026 07:20'
        },
        // ===== ВОСТОК УФЫ =====
        {
            id: 11,
            client_name: 'Николаев Андрей',
            phone: '8-922-345-67-89',
            address: 'ул. Менделеева 42, Уфа',
            category: '💰 Списание средств',
            status: 'resolved',
            lat: 54.7350,
            lon: 56.0150,
            created_at: '22.06.2026 09:30'
        },
        {
            id: 12,
            client_name: 'Смирнова Наталья',
            phone: '8-923-456-78-90',
            address: 'ул. Шафиева 18, Уфа',
            category: '🌍 Роуминг',
            status: 'in_progress',
            lat: 54.7400,
            lon: 56.0100,
            created_at: '24.06.2026 11:45'
        },
        // ===== ЗАПАД УФЫ =====
        {
            id: 13,
            client_name: 'Кузнецов Владимир',
            phone: '8-924-567-89-01',
            address: 'ул. Крупской 7, Уфа',
            category: '📶 Интернет не работает',
            status: 'new',
            lat: 54.7400,
            lon: 55.9500,
            created_at: '25.06.2026 14:00'
        },
        {
            id: 14,
            client_name: 'Федорова Оксана',
            phone: '8-925-678-90-12',
            address: 'ул. Лесная 23, Уфа',
            category: '📱 СМС не приходят',
            status: 'in_progress',
            lat: 54.7450,
            lon: 55.9550,
            created_at: '23.06.2026 16:30'
        },
        // ===== ДОПОЛНИТЕЛЬНЫЕ =====
        {
            id: 15,
            client_name: 'Григорьев Максим',
            phone: '8-926-789-01-23',
            address: 'ул. Айская 5, Уфа',
            category: '📞 Плохая связь',
            status: 'new',
            lat: 54.7280,
            lon: 55.9700,
            created_at: '25.06.2026 15:30'
        },
        {
            id: 16,
            client_name: 'Андреева Ирина',
            phone: '8-927-890-12-34',
            address: 'ул. Революционная 12, Уфа',
            category: '💰 Списание средств',
            status: 'resolved',
            lat: 54.7500,
            lon: 56.0000,
            created_at: '22.06.2026 08:15'
        },
        {
            id: 17,
            client_name: 'Павлов Денис',
            phone: '8-928-901-23-45',
            address: 'ул. Садовая 9, Уфа',
            category: '📶 Интернет не работает',
            status: 'in_progress',
            lat: 54.7150,
            lon: 55.9950,
            created_at: '24.06.2026 19:00'
        },
        {
            id: 18,
            client_name: 'Егорова Марина',
            phone: '8-929-012-34-56',
            address: 'ул. Белореченская 33, Уфа',
            category: '🌍 Роуминг',
            status: 'new',
            lat: 54.7550,
            lon: 55.9600,
            created_at: '25.06.2026 16:45'
        },
        {
            id: 19,
            client_name: 'Тимофеев Артем',
            phone: '8-930-123-45-67',
            address: 'ул. Зорге 55, Уфа',
            category: '📱 СМС не приходят',
            status: 'in_progress',
            lat: 54.7480,
            lon: 55.9650,
            created_at: '24.06.2026 13:00'
        },
        {
            id: 20,
            client_name: 'Никитина Светлана',
            phone: '8-931-234-56-78',
            address: 'ул. Степана Кувыкина 8, Уфа',
            category: '📞 Плохая связь',
            status: 'new',
            lat: 54.7220,
            lon: 56.0000,
            created_at: '25.06.2026 17:00'
        },
        {
            id: 21,
            client_name: 'Максимов Илья',
            phone: '8-932-345-67-89',
            address: 'ул. Достоевского 14, Уфа',
            category: '💰 Списание средств',
            status: 'resolved',
            lat: 54.7380,
            lon: 56.0200,
            created_at: '21.06.2026 10:00'
        },
        {
            id: 22,
            client_name: 'Романова Анастасия',
            phone: '8-933-456-78-90',
            address: 'ул. Российская 21, Уфа',
            category: '📶 Интернет не работает',
            status: 'in_progress',
            lat: 54.7100,
            lon: 55.9800,
            created_at: '24.06.2026 20:30'
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
        
        let color = '#cc3333';   // Мягкий красный
        let statusLabel = 'Активна';
        let borderColor = '#cc3333';
        
        if (comp.status === 'resolved') {
            color = '#00a859';
            statusLabel = 'Решена';
            borderColor = '#00a859';
        } else if (comp.status === 'new') {
            color = '#e68a2e';
            statusLabel = 'Новая';
            borderColor = '#e68a2e';
        } else if (comp.status === 'rejected') {
            color = '#999';
            statusLabel = 'Отклонена';
            borderColor = '#999';
        }
        
        // Кастомная иконка
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:11px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15);">${comp.id}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([comp.lat, comp.lon], { icon })
            .addTo(markersLayer)
            .bindPopup(`
                <div style="font-family:'Inter',sans-serif;min-width:180px;padding:2px;">
                    <div style="font-weight:700;font-size:15px;color:#1a1a1a;">${comp.client_name}</div>
                    <div style="font-size:13px;color:#888;">${comp.phone}</div>
                    <div style="font-size:13px;color:#555;margin-top:4px;padding:4px 8px;background:#f5f5f5;border-radius:6px;">${comp.address}</div>
                    <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:12px;font-weight:600;background:#cc3333;color:white;padding:2px 12px;border-radius:12px;">${comp.category}</span>
                        <span style="font-size:12px;font-weight:500;color:${color};">● ${statusLabel}</span>
                    </div>
                    <div style="font-size:11px;color:#bbb;margin-top:4px;">🆔 ${comp.id} • ${comp.created_at || ''}</div>
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
    
    window.addEventListener('resize', function() {
        setTimeout(() => map.invalidateSize(), 200);
    });
});

// === ОБРАБОТКА НАЖАТИЯ НА ЖАЛОБУ ===
document.addEventListener('click', function(e) {
    const item = e.target.closest('.complaint-item');
    if (item) {
        item.style.borderLeftColor = '#e68a2e';
        setTimeout(() => {
            item.style.borderLeftColor = '#cc3333';
        }, 500);
    }
});
