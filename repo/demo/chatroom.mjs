import path from 'node:path';
import node_nim from 'node-nim';
import { metaHelper } from '@sweet-milktea/utils';
import packageJson from '../package.json' assert { type: 'json' };
import configJson from './config.json' assert { type: 'json' };

const { __dirname } = metaHelper(import.meta.url);

/* p配置 */
const config = {
  ...configJson,
  roomId: 4403512650
};

/* 配置用户数据 */
const appDataDir = path.join(__dirname, '../../cache0/chatroom');

async function chatroomMain() {
  /* NIM初始化 */
  node_nim.nim.client.init(atob(packageJson.hash1), appDataDir, '', {});

  /* NIM初始化event */
  node_nim.nim.initEventHandlers();

  /**
   * NIM账户登录
   * !在登录前最好删除appDataDir里面的文件
   */
  const [loginResult] = await node_nim.nim.client.login(atob(packageJson.hash1), config.account, config.token, null, '');

  /* 获取进入chatroom使用的enter result */
  const [reqEnterCode, reqEnterResult] = await node_nim.nim.plugin.chatRoomRequestEnterAsync(config.roomId, null, '');

  /* Chatroom */
  node_nim.chatroom.init('', '');
  node_nim.chatroom.initEventHandlers();

  /* 设置进入chatroom的房间后的回调函数 */
  node_nim.chatroom.on('enter', async function(rid, status, status2, roomInfo, myInfo) {
    if (status === 5 && status2 === 200) {
      console.log(roomInfo);

      const [his0, his1, chatroomMessages] = await node_nim
        .chatroom.getMessageHistoryOnlineAsync(config.roomId, { limit_: 20 }, null, '');

      console.log(chatroomMessages);

      node_nim.chatroom.on('receiveMsg', function(n, msg) {
        console.log(msg);
      });
    }
  });

  /* 进入chatroom的房间 */
  node_nim.chatroom.enter(config.roomId, reqEnterResult, {}, '');
}

chatroomMain();