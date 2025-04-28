document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let currentFilter = 'all';
  
    // Инициализация приложения
    function init() {
      renderTasks();
      setupEventListeners();
    }
  
    // Настройка обработчиков событий
    function setupEventListeners() {
      addTaskBtn.addEventListener('click', addTask);
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
      });
      
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.dataset.filter;
          renderTasks();
        });
      });
    }
  
    // Добавление новой задачи
    function addTask() {
      const text = taskInput.value.trim();
      if (text) {
        const newTask = db.addTask(text);
        renderTasks();
        taskInput.value = '';
        
        // Показываем уведомление о новой задаче
        notificationManager.showNotification('Добавлена новая задача', text);
      }
    }
  
    // Отрисовка задач в зависимости от фильтра
    function renderTasks() {
      let tasks;
      switch (currentFilter) {
        case 'active':
          tasks = db.getActiveTasks();
          break;
        case 'completed':
          tasks = db.getCompletedTasks();
          break;
        default:
          tasks = db.getAllTasks();
      }
      
      taskList.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <input type="checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-text">${task.text}</span>
          <button class="delete-btn">×</button>
        </li>
      `).join('');
      
      // Добавляем обработчики для чекбоксов и кнопок удаления
      document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTask);
      });
      
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
      });
    }
  
    // Переключение статуса задачи
    function toggleTask(e) {
      const taskId = parseInt(e.target.closest('.task-item').dataset.id);
      db.toggleTask(taskId);
      renderTasks();
    }
  
    // Удаление задачи
    function deleteTask(e) {
      const taskId = parseInt(e.target.closest('.task-item').dataset.id);
      db.deleteTask(taskId);
      renderTasks();
    }
  
    // Запуск приложения
    init();
  });