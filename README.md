# ServerSync

Это приложение для синхронизации каталогов между ПК и сервером

#### Установка

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build
```

Сначала нужно разместить [backend](https://github.com/deonoize/ServerSyncBackend "ServerSyncBackend") на вашем сервере.

После чего необходимо в [данном файле](https://github.com/deonoize/ServerSync/blob/master/src/renderer/main.js "/src/renderer/main.js")  (/src/renderer/main.js) указать адрес сервера:
``` javascript
Vue.prototype.ipserv = "your_address";
```

Теперь если сервер запущен, при запуске приложения сверху будет надпись ONLINE

Добавьте новую синхронизацию, выбрав папку на ПК и серере. На этом все, удачи :)
