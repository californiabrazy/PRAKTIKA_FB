class TodoDB {
    constructor() {
      this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }
  
    getAllTasks() {
      return this.tasks;
    }
  
    getActiveTasks() {
      return this.tasks.filter(task => !task.completed);
    }
  
    getCompletedTasks() {
      return this.tasks.filter(task => task.completed);
    }
  
    addTask(text) {
      const newTask = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      this.tasks.push(newTask);
      this._save();
      return newTask;
    }
  
    toggleTask(id) {
      const task = this.tasks.find(task => task.id === id);
      if (task) {
        task.completed = !task.completed;
        this._save();
      }
    }
  
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id);
      this._save();
    }
  
    _save() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }
  
  const db = new TodoDB();