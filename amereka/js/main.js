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
                },
                {
                    title: 'В процессе',
                },
                {
                    title: 'Завершенные',
                },
            ]
        },
        uniqueId() {
            return this.tasks.length + 1
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
        this.columns = JSON.parse(localStorage.columns ?? JSON.stringify([
            {
                title: 'Новые',
                tasks: []
            },
            {
                title: 'В процессе',
                tasks: []
            },
            {
                title: 'Завершенные',
                tasks: []
            }
        ]))
    }
})