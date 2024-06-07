import process from 'node:process';
import { spawn } from 'node:child_process';

export const isWindows = process.platform === 'win32';
export const npm = isWindows ? 'npm.cmd' : 'npm';

/**
 * 执行命令
 * @param { string } cmd - 命令
 * @param { Array<string> } args - 参数
 * @param { string } cwdPath - 文件夹
 */
export function command(cmd, args, cwdPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: cwdPath
    });

    child.on('close', function(code) {
      resolve();
    });

    child.on('error', function(error) {
      reject(error);
    });
  });
}