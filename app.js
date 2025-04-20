document.addEventListener('DOMContentLoaded', () => {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const editor = document.getElementById('note-text');
    const addBtn = document.getElementById('add-note');
    const notesList = document.getElementById('notes-list');
    const offlineStatus = document.getElementById('offline-status');

    const updateOnlineStatus = () => {
        offlineStatus.style.display = navigator.onLine ? 'none' : 'block';
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    const renderNotes = () => {
        notesList.innerHTML = notes.map((note, index) => `
            <div class="note-item">
                <div class="note-content">${note.text}</div>
                <button class="delete-btn" data-index="${index}">Удалить</button>
            </div>
        `).join('');
    };

    addBtn.addEventListener('click', () => {
        const text = editor.value.trim();
        if (text) {
            notes.push({ text, date: new Date().toISOString() });
            localStorage.setItem('notes', JSON.stringify(notes));
            editor.value = '';
            renderNotes();
        }
    });

    notesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        }
    });

    renderNotes();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}