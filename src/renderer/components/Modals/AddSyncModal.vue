<template>
    <div aria-hidden="true"
         class="modal fade-scale"
         id="addModal"
         role="dialog"
         tabindex="-1">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <header-app @close="closeModal"
                                title="Создание синхронизации">
                    </header-app>
                </div>
                <div class="my-3" v-if="errors.length">
                    <div class="col-12">
                        <p>Пожалуйста исправьте указанные ошибки:</p>
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item list-group-item-danger" v-for="error in errors">{{ error }}</li>
                    </ul>
                </div>
                <div class="modal-body">
                    <div class="row mb-3 align-items-center">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="local">Папка на компьютере</label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control" id="local" placeholder="Выберите папку" v-model="sync.local" disabled>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button" @click="selectLocal">Выбрать папку</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="server">Папка на сервере</label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control" id="server" placeholder="Выберите папку" v-model="sync.server" disabled>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button" @click="selectServer">Выбрать папку</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="check" class="btn btn-primary" type="button">Сохранить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import HeaderApp from './../HeaderApp';
    import {remote} from "electron";

    export default {
        components: {HeaderApp},
        name: 'add-modal',
        inject: ['syncs'],
        data: function () {
            return {
                errors: [],
                sync: {
                    local: "",
                    server: "",
                    select: false
                }
            };
        },
        mounted: function () {
            this.$bus.$on('openAddModal', this.openModal);
        },
        methods: {
            openModal() {
                $('#addModal').modal();
            },
            check(e) {
                this.errors = [];
                if (this.sync.local === '')
                    this.errors.push('Укажите папку на компьютере');
                if (this.sync.server === '')
                    this.errors.push('Укажите папку на сервере');
                if (this.errors.length) return;
                this.save(e);
            },
            save(e) {
                let syncs = this.syncs();
                syncs.push(this.sync);
                this.closeModal(e);
            },
            closeModal(e) {
                $(e.target).closest('.modal').modal('hide')
            },
            selectLocal() {
                const dialog = remote.dialog, WIN = remote.getCurrentWindow();

                let options = {
                    title : "Выбор папки для синхронизации",
                    defaultPath : "С:\\",
                    properties: ['openDirectory','createDirectory']
                };

                //Synchronous
                let filePaths = dialog.showOpenDialogSync(WIN, options);
                if(filePaths !== undefined)
                    this.sync.local = filePaths[0];
            },
            selectServer() {
                this.$bus.$emit("openSelectServerModal");
                this.$bus.$on("selectServerModalResult", (result) => {
                    if (result !== undefined) {
                        this.sync.server = result;
                    }
                    this.$bus.$off("selectServerModalResult");
                });
            }
        }
    }
</script>
