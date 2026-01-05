// Utility Functions untuk Library Management

// Format tanggal
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Format tanggal dengan waktu
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Hitung selisih hari
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Validasi email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validasi nomor telepon Indonesia
function isValidPhone(phone) {
    const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return re.test(phone);
}

// Debounce function untuk search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format angka dengan pemisah ribuan
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Generate warna acak untuk avatar
function getRandomColor() {
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
        '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        api.showNotification('Teks berhasil disalin', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Download data sebagai CSV
function downloadCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Generate PDF (menggunakan jsPDF jika tersedia)
function generatePDF(title, content, filename = 'document.pdf') {
    if (typeof jspdf === 'undefined') {
        console.error('jsPDF tidak tersedia');
        return;
    }
    
    const doc = new jspdf.jsPDF();
    doc.text(title, 10, 10);
    doc.text(content, 10, 20);
    doc.save(filename);
}

// Format durasi
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours} jam ${minutes} menit`;
    } else if (minutes > 0) {
        return `${minutes} menit ${secs} detik`;
    } else {
        return `${secs} detik`;
    }
}

// Local storage dengan expiry
const storageWithExpiry = {
    set: (key, value, ttl) => {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    get: (key) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        const now = new Date();
        
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// Export utilities ke global scope
window.LibraryUtils = {
    formatDate,
    formatDateTime,
    daysBetween,
    isValidEmail,
    isValidPhone,
    debounce,
    formatNumber,
    getRandomColor,
    getInitials,
    copyToClipboard,
    downloadCSV,
    generatePDF,
    formatDuration,
    storageWithExpiry
};