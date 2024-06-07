import path from 'node:path';
import * as node_nim from 'node-nim';
import { metaHelper } from '@sweet-milktea/utils';
import packageJson from '../package.json' assert { type: 'json' };

const { __dirname } = metaHelper(import.meta.url);

const config = {
  account: '',
  token: '',
  roomId: 4403512650
};

const appDataDir = path.join(__dirname, '../../cache0');

/* NIM登录 */
node_nim.nim.client.init(atob(packageJson.hash1), appDataDir, '', {});
node_nim.nim.initEventHandlers();

const [loginResult] = await node_nim.nim.client.login(atob(packageJson.hash1), config.account, config.token, null, '');
const [reqEnterCode, reqEnterResult] = await node_nim.nim.plugin.chatRoomRequestEnterAsync(config.roomId, null, '');

/* Chatroom */
node_nim.chatroom.init('', '');
node_nim.chatroom.initEventHandlers();

node_nim.chatroom.on('enter', async function(rid, status, status2, roomInfo, myInfo) {
  if (status === 5 && status2 === 200) {
    console.log(roomInfo);

    const [his0, his1, his2] = await node_nim
      .chatroom.getMessageHistoryOnlineAsync(config.roomId, { limit_: 20 }, null, '');

    console.log(his2);

    node_nim.chatroom.on('receiveMsg', function(n, msg) {
      console.log(msg);
    });
  }
});

node_nim.chatroom.enter(config.roomId, reqEnterResult, {}, '');