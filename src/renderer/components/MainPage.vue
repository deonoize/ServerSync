<template>
    <main class="container">
        <h3 class="text-center mb-3">Синхронизация</h3>
        <div class="row">
            <div class="col-12 col-md-6 text-center text-md-left mb-3">
                <div @click="saveSync" class="btn btn-primary">
                    Сохранить
                </div>
            </div>
            <div class="col-12 col-md-6 text-center text-md-right mb-3">
                <div @click="addSync" class="btn btn-success">
                    Добавить
                </div>
                <div @click="deleteSelectSync" class="btn btn-danger">
                    Удалить выбранные
                </div>
            </div>
        </div>
        <table class="table table-dark">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Папка на компьютере</th>
                    <th scope="col">Папка на сервере</th>
                    <th class="text-right" scope="col">Выбрать</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(sync, index) in localSyncs" @dblclick="editSync(sync)">
                    <th scope="row">{{ index + 1 }}</th>
                    <td>{{ sync.local }}</td>
                    <td>{{ sync.server }}</td>
                    <td class="text-right">
                        <div class="custom-control custom-checkbox">
                            <input :id="'sync' + index"
                                   class="custom-control-input"
                                   type="checkbox"
                                   v-model="sync.select">
                            <label :for="'sync' + index" class="custom-control-label"></label>
                        </div>
                    </td>
                </tr>
                <tr class="text-center" v-if="localSyncs.length === 0">
                    <th colspan="5">Синхронизаций нет</th>
                </tr>
            </tbody>
        </table>
        <div class="row">
            <div class="col-12 col-md-6 text-center text-md-left mb-3">
                <div @click="saveSync" class="btn btn-primary">
                    Сохранить
                </div>
            </div>
            <div class="col-12 col-md-6 text-center text-md-right mb-3">
                <div @click="addSync" class="btn btn-success">
                    Добавить
                </div>
                <div @click="deleteSelectSync" class="btn btn-danger">
                    Удалить выбранные
                </div>
            </div>
        </div>
    </main>
</template>

<script>
    export default {
        name: "main-page",
        inject: ["syncs"],
        data: function () {
            return {
                localSyncs: [],
            };
        },
        mounted: function () {
            this.localSyncs = this.syncs();
        },
        methods: {
            saveSync() {
                this.$bus.$emit("saveSync");
            },
            deleteSelectSync() {
                this.$bus.$emit("openDialogModal", "Удаление синхронзации", "При удалении синхронизации, файлы больше не будут синхронизироваться.<br>Удалить?", true);
                this.$bus.$on("dialogModalResult", (result) => {
                    if (result) {
                        for (let i = 0; i < this.localSyncs.length; i++) {
                            if (this.localSyncs[i].select) {
                                this.localSyncs.splice(i--, 1);
                            }
                        }
                    }
                    this.$bus.$off("dialogModalResult");
                });
            },
            addSync() {
                this.$bus.$emit("openAddModal");
            },
            editSync(sync) {
                this.$bus.$emit("openEditModal", sync);
            }
        }
    };
</script>
