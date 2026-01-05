// ============================================
// SIMPLE BOOK MANAGER - STANDALONE
// TIDAK MENGUBAH app.js YANG SUDAH ADA
// ============================================

(function() {
    'use strict';
    
    // Variabel global untuk sistem ini
    let books = [];
    let isInitialized = false;
    
    // Inisialisasi sistem
    function init() {
        if (isInitialized) return;
        
        console.log('Simple Book Manager: Initializing...');
        
        // Setup modal
        setupModal();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load existing books
        loadBooks();
        
        // Setup tombol tambah buku
        setupAddBookButtons();
        
        isInitialized = true;
        console.log('Simple Book Manager: Ready');
    }
    
    // Setup modal
    function setupModal() {
        const modal = document.getElementById('simple-add-book-modal');
        const form = document.getElementById('simple-book-form');
        
        if (!modal || !form) {
            console.error('Modal elements not found');
            return;
        }
        
        // Close buttons
        document.getElementById('simple-close-modal').addEventListener('click', closeModal);
        document.getElementById('simple-cancel-btn').addEventListener('click', closeModal);
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Form submission
        form.addEventListener('submit', handleFormSubmit);
        
        // Set tahun default
        document.getElementById('simple-year').value = new Date().getFullYear();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl + B untuk tambah buku (hanya di tab books)
            if (e.ctrlKey && e.key === 'b' && window.location.pathname.includes('index.html')) {
                e.preventDefault();
                openModal();
            }
            
            // ESC untuk tutup modal
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Listen untuk perubahan tab
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    setupAddBookButtons();
                }
            });
        });
        
        // Observe perubahan pada main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            observer.observe(mainContent, { childList: true, subtree: true });
        }
    }
    
    // Setup tombol tambah buku di berbagai tempat
    function setupAddBookButtons() {
        // 1. Tombol di dashboard (Quick Actions)
        const quickAddBtn = document.getElementById('quick-add-book');
        if (quickAddBtn && !quickAddBtn.hasAttribute('data-simple-listener')) {
            quickAddBtn.setAttribute('data-simple-listener', 'true');
            quickAddBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        }
        
        // 2. Tombol di tab buku
        const addBookBtn = document.getElementById('add-book-btn');
        if (addBookBtn && !addBookBtn.hasAttribute('data-simple-listener')) {
            addBookBtn.setAttribute('data-simple-listener', 'true');
            addBookBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        }
        
        // 3. Tombol di tabel kosong
        const addFirstBookBtn = document.getElementById('add-first-book');
        if (addFirstBookBtn && !addFirstBookBtn.hasAttribute('data-simple-listener')) {
            addFirstBookBtn.setAttribute('data-simple-listener', 'true');
            addFirstBookBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        }
        
        // 4. Tambahkan tombol di header jika belum ada
        const contentToolbar = document.querySelector('.content-toolbar');
        if (contentToolbar && !document.getElementById('simple-quick-add-btn')) {
            const quickBtn = document.createElement('button');
            quickBtn.id = 'simple-quick-add-btn';
            quickBtn.className = 'btn btn-primary';
            quickBtn.innerHTML = '<i class="fas fa-plus"></i> Quick Add';
            quickBtn.style.marginLeft = '10px';
            quickBtn.addEventListener('click', openModal);
            contentToolbar.appendChild(quickBtn);
        }
    }
    
    // Buka modal
    function openModal() {
        const modal = document.getElementById('simple-add-book-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Fokus ke input pertama
            setTimeout(() => {
                const firstInput = document.getElementById('simple-title');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }
    
    // Tutup modal
    function closeModal() {
        const modal = document.getElementById('simple-add-book-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form
            const form = document.getElementById('simple-book-form');
            if (form) {
                form.reset();
                document.getElementById('simple-year').value = new Date().getFullYear();
            }
        }
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validasi
        if (!validateForm()) {
            return;
        }
        
        // Ambil data
        const bookData = getFormData();
        
        // Tampilkan loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        submitBtn.disabled = true;
        
        // Simpan buku
        setTimeout(() => {
            saveBook(bookData);
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Tutup modal
            closeModal();
            
            // Tampilkan notifikasi
            showNotification(`Buku "${bookData.title}" berhasil ditambahkan!`, 'success');
            
            // Refresh tampilan
            refreshBookDisplay();
            
            // Update dashboard stats
            updateStats();
            
            // Tambah ke activity log
            addToActivityLog(bookData.title);
            
        }, 500); // Simulasi delay
    }
    
    // Validasi form
    function validateForm() {
        const title = document.getElementById('simple-title').value.trim();
        const author = document.getElementById('simple-author').value.trim();
        const stock = document.getElementById('simple-stock').value;
        
        let isValid = true;
        let message = '';
        
        if (!title) {
            message = 'Judul buku wajib diisi!';
            isValid = false;
        } else if (!author) {
            message = 'Nama penulis wajib diisi!';
            isValid = false;
        } else if (!stock || parseInt(stock) < 1) {
            message = 'Jumlah stok minimal 1!';
            isValid = false;
        }
        
        if (!isValid) {
            showNotification(message, 'error');
        }
        
        return isValid;
    }
    
    // Ambil data dari form
    function getFormData() {
        return {
            id: Date.now(), // ID unik berdasarkan timestamp
            title: document.getElementById('simple-title').value.trim(),
            author: document.getElementById('simple-author').value.trim(),
            isbn: document.getElementById('simple-isbn').value.trim() || null,
            year: document.getElementById('simple-year').value || new Date().getFullYear(),
            publisher: document.getElementById('simple-publisher').value.trim() || null,
            category: document.getElementById('simple-category').value || null,
            stock: parseInt(document.getElementById('simple-stock').value) || 1,
            status: 'available',
            description: document.getElementById('simple-description').value.trim() || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
    
    // Simpan buku
    function saveBook(bookData) {
        // Simpan ke localStorage
        saveToLocalStorage(bookData);
        
        // Tambah ke array books
        books.push(bookData);
        
        // Coba simpan ke sistem utama jika ada
        if (window.app && typeof window.app.createBook === 'function') {
            try {
                const apiData = {
                    title: bookData.title,
                    author_name: bookData.author,
                    isbn: bookData.isbn,
                    published_year: bookData.year,
                    publisher: bookData.publisher,
                    category: bookData.category,
                    stock: bookData.stock,
                    status: 'available',
                    description: bookData.description
                };
                
                // Simpan ke API
                window.app.createBook(apiData);
            } catch (error) {
                console.warn('Gagal menyimpan ke API, hanya tersimpan lokal:', error);
            }
        }
        
        return bookData;
    }
    
    // Simpan ke localStorage
    function saveToLocalStorage(bookData) {
        try {
            let storedBooks = JSON.parse(localStorage.getItem('simple_library_books')) || [];
            
            // Cek duplikat berdasarkan ISBN atau judul+penulis
            const isDuplicate = storedBooks.some(book => 
                (book.isbn && bookData.isbn && book.isbn === bookData.isbn) ||
                (book.title === bookData.title && book.author === bookData.author)
            );
            
            if (!isDuplicate) {
                storedBooks.push(bookData);
                localStorage.setItem('simple_library_books', JSON.stringify(storedBooks));
            }
            
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    // Load buku dari localStorage
    function loadBooks() {
        try {
            const storedBooks = JSON.parse(localStorage.getItem('simple_library_books')) || [];
            books = storedBooks;
            console.log(`Loaded ${books.length} books from storage`);
        } catch (error) {
            console.error('Error loading books:', error);
            books = [];
        }
    }
    
    // Refresh tampilan buku
    function refreshBookDisplay() {
        // Update tabel buku utama jika ada
        updateMainTable();
        
        // Update statistik
        updateStats();
    }
    
    // Update tabel utama
    function updateMainTable() {
        const booksTable = document.getElementById('books-table');
        if (!booksTable) return;
        
        const tbody = booksTable.querySelector('tbody');
        if (!tbody) return;
        
        // Cek jika tabel kosong
        const emptyRow = tbody.querySelector('.empty-row');
        if (emptyRow && books.length > 0) {
            emptyRow.style.display = 'none';
        }
        
        // Tambah buku baru ke tabel
        if (books.length > 0) {
            const lastBook = books[books.length - 1];
            
            // Cek apakah buku sudah ada di tabel
            const existingRows = Array.from(tbody.querySelectorAll('tr'));
            const alreadyExists = existingRows.some(row => {
                const titleCell = row.querySelector('td:nth-child(2)');
                return titleCell && titleCell.textContent.includes(lastBook.title);
            });
            
            if (!alreadyExists) {
                const newRow = createTableRow(lastBook);
                tbody.appendChild(newRow);
                
                // Highlight row baru
                newRow.style.backgroundColor = '#e8f5e9';
                setTimeout(() => {
                    newRow.style.backgroundColor = '';
                }, 2000);
            }
        }
        
        // Update counter
        updateTableCounter();
    }
    
    // Buat baris tabel
    function createTableRow(book) {
        const row = document.createElement('tr');
        
        // Tentukan nomor urut
        const rowCount = document.querySelectorAll('#books-table tbody tr:not(.empty-row)').length + 1;
        
        // Tentukan status
        let statusText = 'Tersedia';
        let statusClass = 'available';
        
        if (book.status === 'borrowed') {
            statusText = 'Dipinjam';
            statusClass = 'borrowed';
        } else if (book.status === 'overdue') {
            statusText = 'Terlambat';
            statusClass = 'overdue';
        }
        
        row.innerHTML = `
            <td>${rowCount}</td>
            <td>
                <strong>${book.title}</strong>
                ${book.isbn ? `<br><small>ISBN: ${book.isbn}</small>` : ''}
            </td>
            <td>${book.author}</td>
            <td>${book.year || '-'}</td>
            <td>${book.stock || 0}</td>
            <td>
                <span class="status ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="window.simpleBookManager.viewBook(${book.id})" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="window.simpleBookManager.editBook(${book.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.simpleBookManager.deleteBook(${book.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    // Update counter tabel
    function updateTableCounter() {
        const bookCountElement = document.getElementById('book-count');
        const bookTotalElement = document.getElementById('book-total');
        
        if (bookCountElement) {
            bookCountElement.textContent = books.length;
        }
        
        if (bookTotalElement) {
            bookTotalElement.textContent = books.length;
        }
    }
    
    // Update statistik dashboard
    function updateStats() {
        // Update total buku
        const totalBooksElement = document.getElementById('total-books');
        if (totalBooksElement) {
            totalBooksElement.textContent = books.length;
        }
        
        // Update available books
        const availableBooks = books.filter(book => book.status === 'available').length;
        const availableBooksElement = document.getElementById('available-books');
        if (availableBooksElement) {
            availableBooksElement.textContent = availableBooks;
        }
    }
    
    // Tampilkan notifikasi
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('simple-notification');
        if (!notification) return;
        
        // Set warna berdasarkan type
        let backgroundColor = '#3498db'; // default blue
        if (type === 'success') backgroundColor = '#27ae60';
        if (type === 'error') backgroundColor = '#e74c3c';
        if (type === 'warning') backgroundColor = '#f39c12';
        
        // Set konten
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        notification.style.backgroundColor = backgroundColor;
        
        // Tampilkan dengan animasi
        notification.style.display = 'block';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Sembunyikan setelah 3 detik
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    // Tambah ke activity log
    function addToActivityLog(bookTitle) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Buat activity item
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon success">
                <i class="fas fa-book"></i>
            </div>
            <div class="activity-content">
                <p><strong>Buku baru ditambahkan</strong></p>
                <p class="activity-time">"${bookTitle}" • Baru saja</p>
            </div>
        `;
        
        // Tambahkan di paling atas
        const firstChild = activityList.firstChild;
        if (firstChild) {
            activityList.insertBefore(activityItem, firstChild);
        } else {
            activityList.appendChild(activityItem);
        }
        
        // Sembunyikan empty message jika ada
        const emptyElement = document.getElementById('activity-empty');
        if (emptyElement) {
            emptyElement.style.display = 'none';
        }
        
        // Batasi hanya 5 aktivitas terbaru
        const allActivities = activityList.querySelectorAll('.activity-item');
        if (allActivities.length > 5) {
            for (let i = 5; i < allActivities.length; i++) {
                allActivities[i].remove();
            }
        }
    }
    
    // ============================================
    // PUBLIC FUNCTIONS
    // ============================================
    
    // Ekspor fungsi publik ke global scope
    window.simpleBookManager = {
        // Buka modal
        openModal: openModal,
        
        // Tutup modal
        closeModal: closeModal,
        
        // View buku
        viewBook: function(bookId) {
            const book = books.find(b => b.id == bookId);
            if (!book) {
                showNotification('Buku tidak ditemukan', 'error');
                return;
            }
            
            const message = `
                JUDUL: ${book.title}
                PENULIS: ${book.author}
                ISBN: ${book.isbn || '-'}
                TAHUN: ${book.year || '-'}
                PENERBIT: ${book.publisher || '-'}
                KATEGORI: ${book.category || '-'}
                STOK: ${book.stock}
                STATUS: ${book.status === 'available' ? 'Tersedia' : 'Dipinjam'}
                ${book.description ? `\nDESKRIPSI:\n${book.description}` : ''}
            `;
            
            alert(message);
        },
        
        // Edit buku
        editBook: function(bookId) {
            const book = books.find(b => b.id == bookId);
            if (!book) {
                showNotification('Buku tidak ditemukan', 'error');
                return;
            }
            
            // Isi form dengan data buku
            document.getElementById('simple-title').value = book.title;
            document.getElementById('simple-author').value = book.author;
            document.getElementById('simple-isbn').value = book.isbn || '';
            document.getElementById('simple-year').value = book.year || '';
            document.getElementById('simple-publisher').value = book.publisher || '';
            document.getElementById('simple-category').value = book.category || '';
            document.getElementById('simple-stock').value = book.stock || 1;
            document.getElementById('simple-description').value = book.description || '';
            
            // Buka modal
            openModal();
            
            // Ganti handler submit untuk update
            const form = document.getElementById('simple-book-form');
            const originalSubmit = form.onsubmit;
            
            form.onsubmit = function(e) {
                e.preventDefault();
                
                // Update data buku
                book.title = document.getElementById('simple-title').value.trim();
                book.author = document.getElementById('simple-author').value.trim();
                book.isbn = document.getElementById('simple-isbn').value.trim() || null;
                book.year = document.getElementById('simple-year').value;
                book.publisher = document.getElementById('simple-publisher').value.trim() || null;
                book.category = document.getElementById('simple-category').value || null;
                book.stock = parseInt(document.getElementById('simple-stock').value) || 1;
                book.description = document.getElementById('simple-description').value.trim() || null;
                book.updated_at = new Date().toISOString();
                
                // Update localStorage
                updateBookInStorage(book);
                
                // Tampilkan notifikasi
                showNotification(`Buku "${book.title}" berhasil diperbarui!`, 'success');
                
                // Tutup modal
                closeModal();
                
                // Refresh tampilan
                refreshBookDisplay();
                
                // Kembalikan handler asli
                form.onsubmit = originalSubmit;
            };
        },
        
        // Hapus buku
        deleteBook: function(bookId) {
            if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
                return;
            }
            
            // Hapus dari array
            const bookIndex = books.findIndex(b => b.id == bookId);
            if (bookIndex === -1) {
                showNotification('Buku tidak ditemukan', 'error');
                return;
            }
            
            const bookTitle = books[bookIndex].title;
            books.splice(bookIndex, 1);
            
            // Update localStorage
            localStorage.setItem('simple_library_books', JSON.stringify(books));
            
            // Tampilkan notifikasi
            showNotification(`Buku "${bookTitle}" berhasil dihapus!`, 'success');
            
            // Refresh tampilan
            refreshBookDisplay();
        },
        
        // Dapatkan semua buku
        getBooks: function() {
            return books;
        },
        
        // Cari buku
        searchBooks: function(query) {
            if (!query) return books;
            
            return books.filter(book => 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                (book.isbn && book.isbn.includes(query))
            );
        },
        
        // Refresh data
        refresh: function() {
            loadBooks();
            refreshBookDisplay();
            showNotification('Data buku telah direfresh', 'info');
        }
    };
    
    // Update buku di storage
    function updateBookInStorage(updatedBook) {
        try {
            let storedBooks = JSON.parse(localStorage.getItem('simple_library_books')) || [];
            const index = storedBooks.findIndex(b => b.id == updatedBook.id);
            
            if (index !== -1) {
                storedBooks[index] = updatedBook;
                localStorage.setItem('simple_library_books', JSON.stringify(storedBooks));
            }
        } catch (error) {
            console.error('Error updating book in storage:', error);
        }
    }
    
    // ============================================
    // AUTO INITIALIZE
    // ============================================
    
    // Tunggu sampai DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM sudah siap
        setTimeout(init, 100);
    }
    
})();