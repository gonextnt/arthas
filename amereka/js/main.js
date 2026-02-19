Vue.component('kanban-column', {
    template: `
    <div class="board-column">
            <h2 class="column-title">{{ column.title }}</h2>
            <div class="task-wrapper">
                <div class="task-card"></div>
                <button>Создать задачу</button>
                <div>
                    <input placeholder="Заголовок задачи">
                    <textarea placeholder="Описание задачи"></textarea>
                    <input type="date">
                    <button>Создать</button>
                    <button>Отмена</button>
                </div>
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
                deadline: null,
            }
        }
    },
    methods: {
        createTask() {
            const task = {
                id: Date.now(),
                title: this.newTask.title,
                description: this.newTask.description,
                deadline: this.newTask.deadline,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'planned',
                isOverdue: false
            }
            this.$emit('move-task', task, this.columnIndex)
            this.showForm = false
            this.newTask = { title: '', description: '', deadline: null }
        },

        moveTask(task, newColumnIndex) {
            this.$emit('move-task', task, newColumnIndex)
        },
        editTask(task) {
            this.$emit('edit-task', task)
        },
        deleteTask(task) {
            this.$emit('delete-task', task)
        }
    }
})

Vue.component('task-card', {
    template: `
        <div class="task">
            <p class="task-title">{{ task.title }}</p>
            <p class="task-description">{{ task.description }}</p>
            <p class="task-deadline">Дэдлайн: {{ formattedDate(task.deadline) }}</p>
            <p class="task-created">Создана: {{ formattedDate(task.createdAT) }}</p>
            <p class="task-updated">Последнее обновление: {{ formattedDate(task.updatedAt) }}</p>
            <button @click="editTask">Редактировать</button>
            <button @click="deleteTask">Удалить</button>
            <button v-if="columnIndex !== 3" @click="moveTask(columnIndex + 1)">Переместить вперед</button>
            <button v-if="columnIndex === 2" @click="moveTask(1)">Вернуть в работу</button>
        </div>
    `,
    props: ['task', 'columnIndex'],
    methods: {
        formattedDate(date) {
            return date ? new Intl.DateTimeFormat('ru-RU').format(new Date(date)) : ''
        },
        editTask() {
            this.$emit('edit-task', this.task)
        },
        deleteTask() {
            this.$emit('delete-task', this.task)
        },
        moveTask(newColumnIndex) {
            this.$emit('move-task', this.task, newColumnIndex)
        }
    }
})

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
                },
            ]
        }
    },
    methods: {
        moveTask(task, newColumnIndex) {
            const currentColumnIndex = this.columns.findIndex(column => column.tasks.includes(task))
            if(currentColumnIndex !== -1) {
                this.columns[currentColumnIndex].tasks = this.columns[currentColumnIndex].tasks.filter(t => t.id !== task.id)
            }
            task.status = ['planned', 'in-progress', 'testing', 'completed'][newColumnIndex]
            task.updateAt = new Date()

            if (newColumnIndex === 3) {
                task.isOverdue = task.deadline && new Date(task.deadline) < new Date()
            }
            this.columns[newColumnIndex].tasks.push(task)
        },
        editTask(task) {
            task.title = prompt('Введите новый заголовок: ', task.title) || task.title
            task.description = prompt('Введите новое описание: ', task.description) || task.description
            task.deadline = prompt('Введите новый дэдлайн (YYYY-MM-DD):', task.deadline) || task.deadline
            task.updatedAt = new Date()
        },
        deleteTask(task) {
            const columnIndex = this.columns.findIndex(column => column.tasks.includes(task))
            if(columnIndex !== -1) {
                this.columns[columnIndex].tasks = this.columns[columnIndex].tasks.filter(t => t.id !== task.id)
            }
        },
    }
})