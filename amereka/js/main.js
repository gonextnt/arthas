Vue.component('task-card', {
    template: `
        <div class="task" :class="taskClass">
            <div v-if="!isEditing && !isReturningToWork">
                <p class="task-title">{{ task.title }}</p>
                <p class="task-description">{{ task.description }}</p>
                <p class="task-meta">Создана: {{ formatDate(task.createdAt) }}</p>
                <p class="task-meta">Обновлена: {{ formatDate(task.updatedAt) }}</p>
                <p class="task-meta">Дэдлайн: {{ formatDate(task.deadline) }}</p>
                <div v-if="task.returnReason" class="task-return-reason">
                    Причина возврата: {{ task.returnReason }}
                </div>
                <div class="task-actions">
                    <button @click="startEditing">Редактировать</button>
                    <button class="delete" @click="deleteTask">Удалить</button>
                    <button v-if="columnIndex < 3" class="move-forward" @click="moveForward">→</button>
                    <button v-if="columnIndex === 2" class="return-to-work" @click="startReturningToWork">← Вернуть</button>
                </div>
            </div>
            
            <div v-else-if="isEditing" class="edit-form">
                <input v-model="editedTask.title" placeholder="Заголовок задачи">
                <textarea v-model="editedTask.description" placeholder="Описание задачи"></textarea>
                <input type="date" v-model="editedTask.deadline">
                <div class="task-actions">
                    <button @click="saveEditing">Сохранить</button>
                    <button @click="cancelEditing">Отмена</button>
                </div>
            </div>
            
            <div v-else-if="isReturningToWork" class="return-form">
                <textarea v-model="returnReason" placeholder="Причина возврата в работу"></textarea>
                <div class="task-actions">
                    <button @click="confirmReturnToWork">Подтвердить</button>
                    <button @click="cancelReturnToWork">Отмена</button>
                </div>
            </div>
        </div>
    `,
    props: ['task', 'columnIndex'],
    data() {
        return {
            isEditing: false,
            isReturningToWork: false,
            returnReason: '',
            editedTask: {
                title: this.task.title,
                description: this.task.description,
                deadline: this.task.deadline ? new Date(this.task.deadline).toISOString().split('T')[0] : ''
            }
        }
    },
    computed: {
        taskClass() {
            if (this.columnIndex === 3) {
                return this.task.isOverdue ? 'task-overdue' : 'task-on-time';
            }
            return '';
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return '—';
            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        },
        startEditing() {
            this.isEditing = true;
            this.editedTask = {
                title: this.task.title,
                description: this.task.description,
                deadline: this.task.deadline ? new Date(this.task.deadline).toISOString().split('T')[0] : ''
            };
        },
        saveEditing() {
            if (!this.editedTask.title.trim()) {
                alert('Заголовок задачи обязателен');
                return;
            }
            if (!this.editedTask.deadline) {
                alert('Укажите дэдлайн');
                return;
            }

            const updatedTask = {
                ...this.task,
                title: this.editedTask.title.trim(),
                description: this.editedTask.description.trim(),
                deadline: new Date(this.editedTask.deadline),
                updatedAt: new Date()
            };

            this.$emit('edit-task', updatedTask, this.columnIndex);
            this.isEditing = false;
        },
        cancelEditing() {
            this.isEditing = false;
        },
        deleteTask() {
            if (confirm('Удалить задачу?')) {
                this.$emit('delete-task', this.task);
            }
        },
        moveForward() {
            this.$emit('move-task', this.task, this.columnIndex + 1);
        },
        startReturningToWork() {
            this.isReturningToWork = true;
            this.returnReason = '';
        },
        confirmReturnToWork() {
            if (!this.returnReason.trim()) {
                alert('Укажите причину возврата');
                return;
            }
            this.$emit('move-task', this.task, 1, this.returnReason.trim());
            this.isReturningToWork = false;
        },
        cancelReturnToWork() {
            this.isReturningToWork = false;
        }
    }
});

Vue.component('kanban-column', {
    template: `
        <div class="board-column">
            <h2 class="column-title">{{ column.title }}</h2>
            <div class="task-wrapper">
                <task-card
                    v-for="task in column.tasks"
                    :key="task.id"
                    :task="task"
                    :column-index="columnIndex"
                    @move-task="onMoveTask"
                    @edit-task="onEditTask"
                    @delete-task="onDeleteTask"
                ></task-card>
                <div v-if="showForm" class="task-form">
                    <div v-if="errors.length" class="errors">
                        <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
                    </div>
                    <input v-model="newTask.title" placeholder="Заголовок задачи">
                    <textarea v-model="newTask.description" placeholder="Описание задачи"></textarea>
                    <input type="date" v-model="newTask.deadline" min="2024-01-01">
                    <div class="task-actions">
                        <button @click="createTask">Создать задачу</button>
                        <button @click="showForm = false">Отмена</button>
                    </div>
                </div>
                <button 
                    v-if="columnIndex === 0 && !showForm"
                    @click="showForm = true"
                >+ Создать задачу</button>
            </div>
        </div>
    `,
    props: ['column', 'columnIndex'],
    data() {
        return {
            showForm: false,
            newTask: {
                title: '',
                description: '',
                deadline: ''
            },
            errors: []
        }
    },
    methods: {
        onMoveTask(task, newColumnIndex, returnReason) {
            this.$emit('move-task', task, newColumnIndex, returnReason);
        },
        onEditTask(task, columnIndex) {
            this.$emit('edit-task', task, columnIndex);
        },
        onDeleteTask(task) {
            this.$emit('delete-task', task);
        },
        createTask() {
            this.errors = [];

            if (!this.newTask.title.trim()) {
                this.errors.push("Заголовок задачи обязателен");
            }

            if (!this.newTask.deadline) {
                this.errors.push("Укажите дэдлайн");
            }

            if (this.errors.length > 0) return;

            const task = {
                id: Date.now(),
                title: this.newTask.title.trim(),
                description: this.newTask.description.trim(),
                deadline: new Date(this.newTask.deadline),
                createdAt: new Date(),
                updatedAt: new Date(),
                returnReason: null,
                isOverdue: false
            };

            this.$emit('add-task', task, this.columnIndex);

            this.showForm = false;
            this.newTask = { title: '', description: '', deadline: '' };
        }
    }
});

let app = new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {
                    title: 'Запланированные задачи',
                    tasks: []
                },
                {
                    title: 'Задачи в работе',
                    tasks: []
                },
                {
                    title: 'Тестирование',
                    tasks: []
                },
                {
                    title: 'Выполненные задачи',
                    tasks: []
                }
            ]
        }
    },
    methods: {
        addTask(task, columnIndex) {
            this.columns[columnIndex].tasks.push(task);
        },
        moveTask(task, newColumnIndex, returnReason = null) {

            const currentColumnIndex = this.columns.findIndex(column =>
                column.tasks.some(t => t.id === task.id)
            );

            if (currentColumnIndex === -1) return;


            this.columns[currentColumnIndex].tasks = this.columns[currentColumnIndex].tasks.filter(t => t.id !== task.id);


            const updatedTask = {
                ...task,
                updatedAt: new Date(),
                returnReason: returnReason || null
            };


            if (newColumnIndex === 3) {
                updatedTask.isOverdue = new Date(task.deadline) < new Date();
            }


            this.columns[newColumnIndex].tasks.push(updatedTask);
        },
        editTask(updatedTask, columnIndex) {
            const taskIndex = this.columns[columnIndex].tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                this.columns[columnIndex].tasks.splice(taskIndex, 1, updatedTask);
            }
        },
        deleteTask(taskToDelete) {
            this.columns.forEach(column => {
                column.tasks = column.tasks.filter(task => task.id !== taskToDelete.id);
            });
        }
    },
    watch: {
        columns: {
            handler(value) {
                localStorage.setItem('kanban-data', JSON.stringify(value));
            },
            deep: true
        }
    },
    mounted() {
        const savedData = localStorage.getItem('kanban-data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.columns = parsed.map(column => ({
                    ...column,
                    tasks: column.tasks.map(task => ({
                        ...task,
                        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                        updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
                        deadline: task.deadline ? new Date(task.deadline) : null
                    }))
                }));
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
    }
});