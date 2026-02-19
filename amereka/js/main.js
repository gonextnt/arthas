Vue.component('create-task', {
    template: `
    <form>
        <p>Создание заметки</p>
        <input id="title" type="text" placeholder="Название задачи">
        <div class="create-task">
            <div class="create-task__form">
                <p>Пункты списка</p>
                <button type="button">
                    Добавить
                </button>
            </div>
            <input type="text" placeholder="Название пункта">
        </div>
        <button>Создать заметку</button>
    </form>
    `,
    props: {
        uniqueId: {
            type: Number,
            required: true,
        }
    },
    data(){
        return {
            title: '',
            subtasks: []
        }
    },
    computed: {
        canCreate() {
            return this.title.length && this.subtasks.length >= 3 && this.subtasks.length <= 5
        }
    },
    methods: {
        createTask() {
            this.$emit('create-task', {
                id: this.uniqueId,
                title: this.title,
                subtasks: this.subtasks,
                finishedAt: null
            })

            this.title = ''
            this.subtasks = []
        }
    }
})

let app = new Vue({
    el: '#app',

    data() {
        return {
            tasks: []
        }
    },

    computed: {
        columns() {
            return [
                {
                    title: 'Новые',
                    tasks: this.filteredColumn(this.tasks, 0, 50)
                },
                {
                    title: 'В процессе',
                    tasks: this.filteredColumn(this.tasks, 51, 99)
                },
                {
                    title: 'Завершенные',
                    tasks: this.filteredColumn(this.tasks, 100, 100)
                },
            ]
        },
        uniqueId() {
            return this.tasks.length + 1
        }
    },

    methods: {
        filteredColumn(tasks, min, max) {
            return tasks.filter((task) => {
                const percentage = this.completedPercentage(task.subtasks)
                return percentage >= min && percentage <= max
            })
        },

        completedPercentage(subtasks) {
            return 100 * (subtasks.reduce((acc, subtasks) => acc + +subtasks.completed, 0) / (subtasks.length || 1))
        },

        onCompletedPercentage(subtasks) {
            if (this.completedPercentage(task.subtasks) === 100) {
                task.finishedAt = new Date()
            }
        },

        formattedDate(str) {
            return new Intl.DateTimeFormat('ru-RU', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).format(new Date(str))
        },
        columnDisabled(columnIndex) {
            switch (columnIndex) {
                case 0: return this.column[1].tasks.length >= 5
                case 2: return columnIndex === 2
            }
        }
    },


    watch: {
        columns: {
            handler(value) {
                localStorage.columns = JSON.stringify(value)
            },
            deep: true
        }
    },

    mounted() {
        this.columns = JSON.parse(localStorage.columns ?? JSON.stringify(
            {
                columnOne: [],
                columnTwo: [],
                columnThree: [],
            }
    ]))
    ))
    }
})