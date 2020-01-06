<template>
    <div id="app">
        <div class="app-content">
            <header-app :is-app="true"
                        :is-can-max="true"
                        :is-can-min="true"
                        :title="'ServerSync - синхронизация файлов'"
                        @close="close"
                        @maximize="maximize"
                        @minimize="minimize">
            </header-app>
            <div @click="ws.close()" class="text-center">{{ statusWS ? "ONLINE" : "OFFLINE" }}</div>
            <router-view></router-view>
            <dialog-modal></dialog-modal>
            <add-sync-modal></add-sync-modal>
            <select-server-modal></select-server-modal>
            <edit-sync-modal></edit-sync-modal>
        </div>
    </div>
</template>

<script>
    import HeaderApp from "./components/HeaderApp";
    import DialogModal from "./components/Modals/DialogModal";
    import AddSyncModal from "./components/Modals/AddSyncModal";
    import SelectServerModal from "./components/Modals/SelectServerModal";
    import EditSyncModal from "./components/Modals/EditSyncModal";

    import "bootstrap/dist/js/bootstrap.bundle.js";
    import {remote} from "electron";
    import path from "path";

    export default {
        name: "server-sync",
        components: {HeaderApp, DialogModal, AddSyncModal, SelectServerModal, EditSyncModal},
        provide: function () {
            return {
                syncs: () => this.syncs,
            };
        },
        data: function () {
            return {
                syncs: [],
                tray: undefined,
                ws: undefined,
                statusWS: false,
                fileSending: {},
                isSync: false,
            };
        },
        mounted: function () {
            this.get();
            this.$bus.$on("saveSync", this.save);

            $(document).on("show.bs.modal", ".modal", function () {
                let zIndex = 1040 + (10 * $(".modal:visible").length);
                $(this).css("z-index", zIndex);
                setTimeout(function () {
                    $(".modal-backdrop").not(".modal-stack").css("z-index", zIndex - 1).addClass("modal-stack");
                }, 0);
            });
            setTimeout(function () {
                $(".boot-screen").fadeOut("slow");
            }, 500);

            this.ws = new WebSocket("ws://" + this.ipserv + ":3000");
            this.ws.onopen = () => this.statusWS = true;
            this.ws.onclose = () => this.statusWS = false;
            this.ws.onmessage = response => {
                let msg = JSON.parse(response.data);
                //console.log(msg);
                switch (msg["type"]) {
                    case "getFile": {
                        let sync = this.syncs.find(el => el.local === msg.local);
                        if (sync !== undefined)
                            if (this.ws.readyState === this.ws.OPEN) {
                                let pathFile = path.join(sync.local, msg["file"]);
                                try {
                                    if(this.fileSending[pathFile] === undefined)
                                        this.fileSending[pathFile] = this.$fs.openSync(pathFile, 'r');
                                } catch (e) {}
                                let stats;
                                try {
                                    stats = this.$fs.statSync(pathFile);
                                } catch (e) {
                                    try {
                                        this.$fs.closeSync(this.fileSending[pathFile]);
                                    } catch (e) {}
                                    delete this.fileSending[pathFile];
                                    break;
                                }
                                if(msg["offset"] < stats["size"]) {
                                    let countByte = stats["size"] - msg["offset"] < 1000000 ? stats["size"] - msg["offset"] : 1000000;
                                    let buf = Buffer.alloc(countByte);
                                    let fd = this.fileSending[pathFile];
                                    try {
                                        this.$fs.readSync(fd, buf, 0, countByte, msg["offset"]);
                                    } catch (e) {
                                        try {
                                            this.$fs.closeSync(this.fileSending[pathFile]);
                                        } catch (e) {}
                                        delete this.fileSending[pathFile];
                                        break;
                                    }
                                    this.ws.send(JSON.stringify({
                                        type: "sendFile",
                                        local: sync.local,
                                        server: sync.server,
                                        file: msg["file"],
                                        part: buf,
                                        offset: msg["offset"],
                                        size: stats["size"],
                                        change: stats["mtimeMs"]
                                    }));
                                }
                            }
                        break;
                    }
                    case "fileReceived": {
                        let sync = this.syncs.find(el => el.local === msg.local);
                        if (sync !== undefined) {
                            let pathFile = path.join(sync.local, msg["file"]);
                            try {
                                this.$fs.closeSync(this.fileSending[pathFile]);
                            } catch (e) {}
                            delete this.fileSending[pathFile];
                        }
                        break;
                    }
                }
            };

            setInterval(() => {
                if(this.isSync && Object.keys(this.fileSending).length === 0)
                    this.isSync = false;
                if (!this.isSync) {
                    this.isSync = true;
                    this.syncs.forEach(sync => {
                        let tree = [];
                        this.scan(sync.local, tree);
                        if (this.ws.readyState === this.ws.OPEN)
                            this.ws.send(JSON.stringify({
                                type: "sync", local: sync.local, server: sync.server, tree
                            }));
                    });
                }
                if (this.tray !== undefined && !this.tray.isDestroyed()) {
                    if(this.isSync && Object.keys(this.fileSending).length === 0) {
                        this.tray.setToolTip("ServerSync\nСинхронизировано");
                    } else {
                        this.tray.setToolTip("ServerSync\nСинхронизация");
                    }
                }
            }, 1000);
        },
        methods: {
            scan(dir, arr) {
                this.$fs.readdirSync(dir).forEach(file => {
                    let pathFile = path.join(dir, file);
                    let stats = this.$fs.statSync(pathFile);
                    if (stats.isDirectory()) {
                        let dirNew = {
                            id: file,
                            isDir: true,
                            children: []
                        };
                        arr.push(dirNew);
                        this.scan(pathFile, dirNew.children);
                    } else {
                        let dirNew = {
                            id: file,
                            isDir: false,
                            size: stats["size"],
                            change: stats["mtimeMs"]
                        };
                        arr.push(dirNew);
                    }
                });
            },
            save() {
                let info = "";

                this.syncs.forEach((el, index) => {
                    info += el.local + "\n" + el.server;
                    if (index + 1 !== this.syncs.length)
                        info += "\n";

                });
                this.$fs.writeFileSync("program_config/SyncsInfo.txt", info);
                this.$bus.$emit("openDialogModal", "Уведомление", "Синхронизации сохранены!");
            },
            get() {
                let syncs = "";
                try {
                    syncs = this.$fs.readFileSync("program_config/SyncsInfo.txt", "utf8");
                } catch (e) {
                    syncs = "";
                }
                let lines = syncs.split("\n");
                let sync;
                lines.forEach((el, index) => {
                    if (index % 2 === 0) {
                        sync = {
                            local: el,
                            server: "",
                            select: false
                        };
                    } else {
                        sync.server = el;
                        if (sync.local !== "" && sync.server !== "")
                            this.syncs.push(sync);
                    }
                });
            },
            close() {
                remote.getCurrentWindow().close();
            },
            minimize() {
                let tray = new remote.Tray(path.join(__dirname, "assets/image/icon.ico"));
                tray.setToolTip("ServerSync");
                tray.setContextMenu(remote.Menu.buildFromTemplate([
                    {
                        label: "Открыть", click: function () {
                            remote.getCurrentWindow().show();
                            tray.destroy();
                        }
                    },
                    {
                        label: "Выход", click: function () {
                            remote.getCurrentWindow().close();
                        }
                    }
                ]));
                tray.on("double-click", function () {
                    remote.getCurrentWindow().show();
                    tray.destroy();
                });
                this.tray = tray;
                remote.getCurrentWindow().hide();
            },
            maximize() {
                let win = remote.getCurrentWindow();
                win.isMaximized() ? win.unmaximize() : win.maximize();
            }
        }
    };
</script>
