// Data Storage
let tasks = [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterSelect = document.getElementById('filterSelect');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const errorMessage = document.getElementById('errorMessage');

// Inialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderTasks();
    attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    filterSelect.addEventListener('change', filterTasks);
    deleteAllBtn.addEventListener('click', deleteAllTasks);
    
    // Clear error message when user starts typing
    taskInput.addEventListener('input', () => {
        errorMessage.textContent = '';
    });
    dateInput.addEventListener('input', () => {
        errorMessage.textContent = '';
    });
}

// Add Task
function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dateInput.value;

    // Validation
    if (!validateInput(taskText, dueDate)) {    
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        dueDate: dueDate,
        status: 'pending',
        completed: false
    };    

    tasks.push(newTask);
    saveTasksToLocalStorage();
    renderTasks();

    // Clear inputs and error message
    taskInput.value = '';
    dateInput.value = '';
    errorMessage.textContent = '';
}

// Validate Input
function validateInput(taskText, dueDate) {
    if (!taskText) {
        errorMessage.textContent = 'Please enter a task.';
        return false;
    }

    if (taskText.length < 3) {
        errorMessage.textContent = 'Task must be at least 3 characters long.';
        return false;
    }

    if (!dueDate) {
        errorMessage.textContent = 'Please select a due date.';
        return false;
    }

    const today = new Date();
    const selectedDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        errorMessage.textContent = 'Due date must cannot be in the past.';
        return false;
    }

    return true;
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    taskInput.focus();
}

// Clear Inputs
function clearInputs() {
    taskInput.value = '';
    dateInput.value = '';
    errorMessage.textContent = '';
    taskInput.focus();
}

// Toggle Task Completion
function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.status = task.completed ? 'completed' : 'pending';
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Delete Task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasksToLocalStorage();
        renderTasks();
    }
}  

// Delete All Tasks
function deleteAllTasks() {
    if (tasks.length === 0) {
        alert('No tasks to delete.');
        return;
    }
    if (confirm('Are you sure you want to delete ALL tasks?')) {
        tasks = [];
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Filter Tasks
function filterTasks(e) {
    currentFilter = e.target.value;
    renderTasks();
}

// Get Filtered Tasks
function getFilteredTasks() {
    if (currentFilter === 'all') {
        return tasks;
    } else if (currentFilter === 'completed') {
        return tasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        return tasks.filter(t => !t.completed);
    }
    return tasks;
}

// Render Tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p class="no-tasks">No tasks available.</p>';
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-text">${escapeHtml(task.text)}</div>
            <div class="task-date">Due: ${formatDate(task.Date)}</div>
            <div>
                <span class="status-badge ${task.status}">
                    ${task.status}
                </span>
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Format Date
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('todoTasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (e) {
            tasks = [];
        }
    }
}