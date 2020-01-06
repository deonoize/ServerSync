<template>
    <div aria-hidden="true"
         class="modal fade-scale"
         id="selectModal"
         role="dialog"
         tabindex="-1">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <header-app @close="closeModal"
                                title="Выбор папки для синхронизации">
                    </header-app>
                </div>
                <div class="modal-body">
                    <p v-if="select !== ''">{{ select }}</p>
                    <p v-if="select === ''">Не выбрано</p>
                    <table class="table table-dark">
                        <tbody>
                            <tr :class="{'active' : folder.select}"
                                @click="selectFolder(folder)"
                                @dblclick="openFolder(folder)"
                                v-for="folder in current">
                                <td>{{ folder.id }}</td>
                            </tr>
                            <tr class="empty" v-if="!current || current.length === 0">
                                <td class="text-center">Пусто :)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button @click="check" class="btn btn-primary" type="button">Выбрать</button>
                    <button :class="{'btn btn-info': true, 'disabled': current === folders}" @click="up" type="button">
                        Выше
                    </button>
                    <button @click="createFolder" class="btn btn-success" type="button">Создать</button>
                    <button @click="cancel" class="btn btn-danger" type="button">Отменить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import HeaderApp from "./../HeaderApp";
    import {remote} from "electron";

    export default {
        components: {HeaderApp},
        name: "select-server-modal",
        inject: ["syncs"],
        data: function () {
            return {
                select: "\\",
                current: [],
                parents: [],
                parentsId: [],
                folders: []
            };
        },
        mounted: function () {
            this.$bus.$on("openSelectServerModal", this.openModal);
        },
        methods: {
            openModal() {
                this.$http.get("http://" + this.ipserv + ":8080/api/getFolders")
                    .then(response => {
                        this.folders = response.data;
                        this.current = this.folders;
                        this.select = "\\";
                        $("#selectModal").modal();
                    });

            },
            check(e) {
                this.errors = [];
                if (this.errors.length) return;
                this.save(e);
            },
            save(e) {
                this.closeModal(e);
            },
            cancel(e) {
                this.select = "";
                this.closeModal(e);
            },
            closeModal(e) {
                $(e.target).closest(".modal").modal("hide");
                this.$bus.$emit("selectServerModalResult", this.select === "" ? undefined : this.select);
            },
            selectFolder(folder) {
                if (!folder.select) {
                    this.current.forEach(el => el.select = false);
                    this.$set(folder, "select", true);
                    this.updateSelect(folder);
                } else {
                    this.$set(folder, "select", false);
                    this.updateSelect();
                }
            },
            openFolder(folder) {
                this.updateSelect(folder);

                this.parents.push(this.current);
                this.parentsId.push(folder.id);
                this.current.forEach(el => el.select = false);
                if (!folder.children) folder.children = [];
                this.current = folder.children;
            },
            createFolder() {
                this.$bus.$emit("openDialogModalWithInput", "Название папки", "Введите название папки");
                this.$bus.$on("dialogModalResult", (result) => {
                    if (result) {
                        if (result !== "") {
                            this.current.push({id: result});
                        }
                    }
                    this.$bus.$off("dialogModalResult");
                });
            },
            up() {
                if (this.current !== this.folders) {
                    let last = this.parents.pop();
                    this.parentsId.pop();
                    if (last !== undefined) {
                        this.current = last;
                        this.updateSelect();
                    }
                }
            },
            updateSelect(folder = undefined) {
                this.select = "\\";
                this.parentsId.forEach(el => this.select += el + "\\");
                if (folder === undefined) {
                    if (this.select !== "\\")
                        this.select = this.select.substr(0, this.select.length - 1);
                } else {
                    this.select += folder.id;
                }
            }
        }
    };
</script>

<style>

    #selectModal .table tr:not(.empty) {
        cursor: pointer;
        transition: .5s;
    }

    #selectModal .table tr:not(.empty):hover, #selectModal .table tr:not(.empty).active {
        background-color: #0069d9;
    }

    #selectModal .table tr:not(.empty):hover td, #selectModal .table tr:not(.empty).active td {
        border-color: #0069d9;
    }
</style>
