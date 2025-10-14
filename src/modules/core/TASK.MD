Переиименовать все в менеджеры - storeMaganer, wsManager, moduleManager и сделать одинаковый экспорт и имена ws.manager.js, store.manager.js, module.manager.js, i18n.manager.js
/Users/magicofoz/Development/OZDAO/ozdao.dev/app/martyrs/src/modules/core 
/Users/magicofoz/Development/OZDAO/ozdao.dev/app/martyrs/src/modules/core/core.client.js

ну и в целом в store.js все сделать как это менеджер сторов названия

import store from './views/classes/store.js';
import websockets from './views/classes/core.websocket.js';
import { i18nManager }  from '@martyrs/src/modules/core/views/classes/core.i18n.js';
import { moduleRegistry } from './views/classes/module-registry.js';

сюда же потом пойдет (это в коменты добавь)
-нотификейшен менеджер
-алерт менеджер