/*==============================
  1. SELECT ELEMENTS
==============================*/
const themeButton = document.getElementById('theme-toggle');
const todoForm = document.getElementById('todo-form');
const inputField = document.getElementById('input-field');
const todoList = document.getElementById('todo-list');
const itemsLeft = document.getElementById('items-left');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const darkTheme = 'dark';

/*==============================
  2. STATE
==============================*/
let todos = []; // array of todo objects
let currentFilter = 'all';
const selectedTheme = localStorage.getItem('selected-theme');

/*==============================
  3. UTILITY FUNCTIONS
==============================*/

// Generate unique ID
function generateID() {
    return Date.now().toString();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Load todos from localStorage
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) todos = JSON.parse(stored);
}

// Apply saved theme
function applyTheme() {
    if (selectedTheme === 'dark') document.documentElement.classList.add(darkTheme);
    else document.documentElement.classList.remove(darkTheme);
}

// Get current theme
function getCurrentTheme() {
    return document.documentElement.classList.contains(darkTheme) ? 'dark' : 'light';
}

/*==============================
  4. RENDER FUNCTION
==============================*/
function renderTodos() {
    todoList.innerHTML = '';

    // Apply filter
    let filteredTodos = todos;
    if (currentFilter === 'active') filteredTodos = todos.filter(t => !t.completed);
    else if (currentFilter === 'completed') filteredTodos = todos.filter(t => t.completed);

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#3a3b4f] todo-item transition-all duration-300 ease-in-out select-none';
        li.setAttribute('draggable', 'true');
        li.setAttribute('data-id', todo.id);

        // Left: checkbox + text
        const left = document.createElement('div');
        left.className = 'flex items-center gap-3';
        const checkbox = document.createElement('span');
        checkbox.className = `w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer p-2
        ${todo.completed ? 'bg-[linear-gradient(to_right,rgba(109,191,248,1),rgba(159,127,247,1))] text-white' : 'border-gray-400 dark:border-gray-600'}`;
        checkbox.innerHTML = todo.completed ? '&#10003;' : ''; // checkmark character
        checkbox.addEventListener('click', () => toggleTodo(todo.id));

        const text = document.createElement('span');
        text.textContent = todo.text;
        text.className = todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'dark:text-gray-200';

        left.appendChild(checkbox);
        left.appendChild(text);

        // Right: delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.className = 'text-red-500 hover:text-red-700 hover:scale-125 transition-all duration-300 cursor-pointer';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id, li));

        li.appendChild(left);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);

        // ----------------------
        // Drag & Drop Events
        // ----------------------
        li.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', todo.id);
            li.classList.add('opacity-50');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('opacity-50');
        });

        li.addEventListener('dragover', e => {
            e.preventDefault();
            li.classList.add('bg-gray-200', 'dark:bg-[#3a3b4f]');
        });

        li.addEventListener('dragleave', () => {
            li.classList.remove('bg-gray-200', 'dark:bg-[#3a3b4f]');
        });

        li.addEventListener('drop', e => {
            e.preventDefault();
            li.classList.remove('bg-gray-200', 'dark:bg-[#3a3b4f]');
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId === todo.id) return;

            const draggedIndex = todos.findIndex(t => t.id === draggedId);
            const targetIndex = todos.findIndex(t => t.id === todo.id);

            const [draggedTodo] = todos.splice(draggedIndex, 1);
            todos.splice(targetIndex, 0, draggedTodo);

            saveTodos();
            renderTodos();
        });
    });

    // Update items left
    updateItemsLeft();
}

/*==============================
  5. CRUD FUNCTIONS
==============================*/
// update items left count
function updateItemsLeft() {
    const activeCount = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Add todo
function addTodo(text) {
    if (!text.trim()) return;
    const newTodo = { id: generateID(), text, completed: false };
    todos.push(newTodo);
    saveTodos();
    renderTodos();
}

// Toggle completed

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    todo.completed = !todo.completed;
    renderTodos();
}

// Delete todo with animation
function deleteTodo(id, liElement) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();

    if (liElement) {
        liElement.classList.add('opacity-0', 'scale-90', 'p-0', 'h-0', 'overflow-hidden');
        liElement.addEventListener('transitionend', (e) => {
            if (e.target === liElement) { // only fire for the li itself
                liElement.remove();       // remove the element
            }
        });
        updateItemsLeft();
    } else {
        renderTodos();
    }
}

// Clear completed
function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

// Apply filter
function applyFilter(filter) {
    currentFilter = filter;
    renderTodos();

    // Update active button styling
    filterButtons.forEach(btn => btn.classList.remove('active', 'text-blue-700', 'dark:text-purple-400', 'font-semibold'));
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    activeBtn?.classList.add('active', 'text-blue-700', 'dark:text-purple-400', 'font-semibold');
}

/*==============================
  6. EVENT LISTENERS
==============================*/

// Form submit
todoForm.addEventListener('submit', e => {
    e.preventDefault();
    addTodo(inputField.value);
    inputField.value = '';
});

// Filter buttons
filterButtons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));

// Clear completed button
clearCompletedBtn.addEventListener('click', clearCompleted);

// Theme toggle
themeButton.addEventListener('click', () => {
    document.documentElement.classList.toggle(darkTheme);
    localStorage.setItem('selected-theme', getCurrentTheme());
});

/*==============================
  7. INITIALIZE APP
==============================*/
applyTheme();
loadTodos();
renderTodos();
applyFilter(currentFilter);
