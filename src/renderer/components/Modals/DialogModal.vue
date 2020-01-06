<template>
    <div aria-hidden="true"
         aria-labelledby="exampleModalCenterTitle"
         class="modal fade-scale"
         id="dialogModal"
         role="dialog"
         tabindex="-1">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <header-app :title="title"
                                @close="closeModal(false, $event)">
                    </header-app>
                </div>
                <div class="modal-body">
                    <p class="text-center" v-html="text"></p>
                    <input v-if="isInput" type="text" class="form-control" v-model="input">
                </div>
                <div class="modal-footer" v-if="isQuestion">
                    <button class="btn btn-success" @click="closeModal(true, $event)" type="button">Да</button>
                    <button class="btn btn-danger" @click="closeModal(false, $event)" type="button">Нет</button>
                </div>
                <div class="modal-footer" v-else>
                    <button class="btn btn-primary" @click="closeModal(false, $event)" type="button">Ок</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import HeaderApp from './../HeaderApp';

    export default {
        components: {HeaderApp},
        name: 'dialog-modal',
        data: function () {
            return {
                title: "Диалоговое окно",
                text: "Сообщение",
                input: "",
                isInput: false,
                isQuestion: false
            };
        },
        mounted: function () {
            this.$bus.$on('openDialogModal', this.openModal);
            this.$bus.$on('openDialogModalWithInput', this.openModalInput);
        },
        methods: {
            openModal(title, text, isQuestion = false) {
                this.title = title;
                this.text = text;
                this.isQuestion = isQuestion;
                $('#dialogModal').modal();
            },
            openModalInput(title, text, defVal = "") {
                this.title = title;
                this.text = text;
                this.input = defVal;
                this.isInput = true;
                $('#dialogModal').modal();
            },
            closeModal(result, e) {
                $(e.target).closest('.modal').modal('hide');
                if(this.isInput) {
                    this.$bus.$emit('dialogModalResult', this.input);
                }
                if(this.isQuestion) {
                    this.$bus.$emit('dialogModalResult', result);
                }
            }
        }
    }
</script>
