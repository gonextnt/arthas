Vue.component('create-task', {
    template: `
   <form class="task-form" @submit.prevent="createTask">
   <div class="task-form__inner">
        <div class="task-form__inner">
           <div class="task-name">
               <p>Создание заметки</p>
               <input class="task-form__input" id="title" type="text" v-model="title" placeholder="Название задачи">
@@ -10,126 +10,160 @@
               <div class="create-task__form">
                   <p>Пункты списка</p>
                   <button 
                        class="create-task__btn"
                        class="task__btn"
                       type="button" 
                       v-if="subtasks.length < 5" 
                       @click="subtasks.push({ title: '', completed: false })"
                   >
                       Добавить
                   </button>
               </div>
                <input class="task-form__input" v-for="(subtask, i) in subtasks" v-model="subtask.title" type="text" placeholder="Название пункта"></div>
        <button class="create-task__btn" :disabled="!canCreate">Создать заметку</button>
                <input class="task-form__input" v-for="(subtask, i) in subtasks" v-model="subtask.title" type="text" placeholder="Название пункта">
            </div>
        </div>
        <button class="task__btn" :disabled="!canCreate">Создать заметку</button>
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
                {
                    title: 'В процессе',
                    tasks: this.filteredColumn(this.tasks, 51, 99)
                },
                {
                    title: 'Завершенные',
                    tasks: this.filteredColumn(this.tasks, 100, 100)
                },
                {
                    title: 'На доработку',
                    tasks: this.tasks.filter(task => task.needsRework)
                }
            ]
        },
            queuedColumns() {
                const queuedColumns = [];
                this.columns.forEach((column, i) => {
                    if (i !== 1) {
                        queuedColumns.push(column);
                        return;
                    }

                    const queuedTasks = column.tasks.reduce((acc, task, j) => {
                        if (j < 5) acc.push(task);
                        else queuedColumns[0].tasks.push(task);
                        return acc;
                    }, [])

                    queuedColumns.push({ title: column.title, tasks: queuedTasks })
                })
                return queuedColumns;
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

            onCompleteSubtask(task) {
                onCompleteSubtask(task) {
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
                        case 0: return this.columns[1].tasks.length >= 5
                        case 2: return columnIndex === 2
                    }
                },

                reworkTask(task) {
                    task.needsRework = true
                    task.subtasks.forEach(subtask => subtask.completed = false)
                },

                completeRework(task) {
                    task.needsRework = false
                    task.title = prompt('Переименуйте задачу: ', task.title) || task.title
                    this.tasks.splice(this.tasks.indexOf(task), 1)
                    this.tasks.unshift(task)
                }
            },


            watch: {
                tasks: {
                    tasks: {
                        handler(value) {
                            localStorage.tasks = JSON.stringify(value)
                        },
                        deep: true
                    }
                },

                mounted() {
                    this.tasks = JSON.parse(localStorage.tasks ?? '[]')
                    this.tasks = JSON.parse(localStorage.tasks ?? '[]')
                }
            })