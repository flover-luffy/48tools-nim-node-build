import path from 'node:path';
import node_nim from 'node-nim';
import { metaHelper } from '@sweet-milktea/utils';
import packageJson from '../package.json' assert { type: 'json' };
import configJson from './config.json' assert { type: 'json' };

const { __dirname } = metaHelper(import.meta.url);

/* 配置 */
const config = {
  ...configJson,
  serverId: 1147919,
  channelId: 1164560
};

/* 配置用户数据 */
const appDataDir = path.join(__dirname, '../../cache0/qchat');

async function qchatMain() {
  /* NIM初始化 */
  node_nim.qchat.instance.init({
    app_data_path: appDataDir
  });

  node_nim.qchat.initEventHandlers();
  node_nim.qchat.instance.initEventHandlers();
  node_nim.qchat.channel.initEventHandlers();
  node_nim.qchat.server.initEventHandlers();
  node_nim.qchat.attachment.initEventHandlers();

  /**
   * NIM账户登录
   * !在登录前最好删除appDataDir里面的文件
   */
  const loginRes = await node_nim.qchat.instance.login({
    appkey: atob(packageJson.hash1),
    accid: config.account,
    login_token: config.token,
    link_address: [
      'qchatlink-yqsx24.netease.im:8080',
      'qchatlink-yqsx24.netease.im:9092',
      'qchatlink-yqsx23.netease.im:8080',
      'qchatlink-yqsx23.netease.im:9092'
    ]
  });

  console.log(loginRes);

  /* qchat */
  node_nim.qchat.instance.on('message', function(msg) {
    console.log(msg);
  });

  const serverSubscribe = await node_nim.qchat.server.subscribe({
    ope_type: 1,
    kNIMQChatSubscribeTypeMsg: 1,
    server_ids: [config.serverId]
  });

  console.log(serverSubscribe);

  /* 获取历史记录 */
  const messagesRes = await node_nim.qchat.message.getMessages({
    server_id: config.serverId,
    channel_id: config.channelId,
    limit: 20
  });

  console.log(messagesRes);
}

qchatMain();