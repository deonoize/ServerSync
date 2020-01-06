<template>
    <header :class="{'header-app': true, 'general-header': isApp}">
        <div class="resize-handle top"></div>
        <div class="resize-handle left"></div>
        <span class="logo">{{ title}}</span>
        <div @click="minimize" class="option" v-if="isCanMin">
            <svg aria-hidden="true" height="10" width="10">
                <path d="M 0,5 10,5 10,6 0,6 Z"></path>
            </svg>
        </div>
        <div @click="maximize" class="option" v-if="isCanMax">
            <svg aria-hidden="true" height="10" width="10">
                <path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z"></path>
            </svg>
        </div>
        <div @click="close" class="option exit">
            <svg aria-hidden="true" height="10" width="10">
                <path d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z"></path>
            </svg>
        </div>
    </header>
</template>

<script>
    export default {
        name: 'header-app',
        props: [
            'title',
            'isApp',
            'isCanMin',
            'isCanMax'
        ],
        methods: {
            close(e) {
                this.$emit('close', e);
            },
            minimize(e) {
                this.$emit('minimize', e);
            },
            maximize(e) {
                this.$emit('maximize', e);
            }
        }
    }
</script>
