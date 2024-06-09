import util from 'node:util';
import path from 'node:path';
import fsPromises from 'node:fs/promises';
import fse from 'fs-extra/esm';
import ncc from '@vercel/ncc';
import zip from 'cross-zip';
import { metaHelper } from '@sweet-milktea/utils';
import { command, npm } from './helper.mjs';
import nodeNimPackageJson from 'node-nim/package.json' assert { type: 'json' };

const zipPromise = util.promisify(zip.zip);
const { __dirname } = metaHelper(import.meta.url);

/* 定义编译目录 */
const buildDir = path.join(__dirname, '../../build');

const win32 = path.join(buildDir, 'win32');
const win64 = path.join(buildDir, 'win64');
const mac = path.join(buildDir, 'mac');
const macArm = path.join(buildDir, 'mac-arm');
const linux64 = path.join(buildDir, 'linux64');

const win32Nim = path.join(win32, 'node-nim');
const win64Nim = path.join(win64, 'node-nim');
const macNim = path.join(mac, 'node-nim');
const macArmNim = path.join(macArm, 'node-nim');
const linux64Nim = path.join(linux64, 'node-nim');

// sdk目录
const win32NimSDKDir = path.join(win32, 'node_modules/node-nim/sdk');
const win32NimSDKBin = path.join(win32NimSDKDir, 'bin');
const win32NimSDKLib = path.join(win32NimSDKDir, 'lib');
const win64NimSDKDir = path.join(win64, 'node_modules/node-nim/sdk');
const win64NimSDKBin = path.join(win64NimSDKDir, 'bin');
const win64NimSDKLib = path.join(win64NimSDKDir, 'lib');
const macNimSDKLib = path.join(mac, 'node_modules/node-nim/sdk/lib');
const macArmNimSDKLib = path.join(macArm, 'node_modules/node-nim/sdk/lib');
const linux64NimSDKLib = path.join(linux64, 'node_modules/node-nim/sdk/lib');
const linux64NimSDKSyslib = path.join(linux64, 'node_modules/node-nim/sdk/syslib');

const nodeModulesNodeNim = path.join(__dirname, '../node_modules/node-nim/dist/node-nim.js');

async function build() {
  // 创建目录
  await Promise.all([
    fsPromises.mkdir(win32Nim, { recursive: true }),
    fsPromises.mkdir(win64Nim, { recursive: true }),
    fsPromises.mkdir(macNim, { recursive: true }),
    fsPromises.mkdir(macArmNim, { recursive: true }),
    fsPromises.mkdir(linux64Nim, { recursive: true })
  ]);

  // 给每个目录安装依赖
  // https://doc.yunxin.163.com/messaging/guide/jI2ODIzNDI?platform=electron
  await command(npm, ['install', 'node-nim', '--arch=ia32', '--platform=win32'], win32);
  await command(npm, ['install', 'node-nim', '--arch=x64', '--platform=win32'], win64);
  await command(npm, ['install', 'node-nim', '--arch=x64', '--platform=darwin'], mac);
  await command(npm, ['install', 'node-nim', '--arch=arm64', '--platform=darwin'], macArm);
  await command(npm, ['install', 'node-nim', '--arch=x64', '--platform=linux'], linux64);

  // 使用ncc编译
  const { code } = await ncc(nodeModulesNodeNim, { minify: true });
  const packageJson = {
    name: nodeNimPackageJson.name,
    version: nodeNimPackageJson.version,
    main: 'dist/index.js'
  };

  await Promise.all([
    fse.outputFile(path.join(win32Nim, 'dist/index.js'), code),
    fse.outputFile(path.join(win64Nim, 'dist/index.js'), code),
    fse.outputFile(path.join(macNim, 'dist/index.js'), code),
    fse.outputFile(path.join(macArmNim, 'dist/index.js'), code),
    fse.outputFile(path.join(linux64Nim, 'dist/index.js'), code),
    fse.writeJSON(path.join(win32Nim, 'package.json'), packageJson),
    fse.writeJSON(path.join(win64Nim, 'package.json'), packageJson),
    fse.writeJSON(path.join(macNim, 'package.json'), packageJson),
    fse.writeJSON(path.join(macArmNim, 'package.json'), packageJson),
    fse.writeJSON(path.join(linux64Nim, 'package.json'), packageJson)
  ]);

  // 拷贝sdk
  await Promise.all([
    fse.copy(win32NimSDKBin, path.join(win32Nim, 'sdk/bin')),
    fse.copy(win32NimSDKLib, path.join(win32Nim, 'sdk/lib')),
    fse.copy(win64NimSDKBin, path.join(win64Nim, 'sdk/bin')),
    fse.copy(win64NimSDKLib, path.join(win64Nim, 'sdk/lib')),
    fse.copy(macNimSDKLib, path.join(macNim, 'sdk/lib')),
    fse.copy(macArmNimSDKLib, path.join(macArmNim, 'sdk/lib')),
    fse.copy(linux64NimSDKLib, path.join(linux64Nim, 'sdk/lib')),
    fse.copy(linux64NimSDKSyslib, path.join(linux64Nim, 'sdk/syslib'))
  ]);

  // 压缩
  await Promise.all([
    zipPromise(win32Nim, 'node-nim-win32.zip'),
    zipPromise(win64Nim, 'node-nim-win64.zip'),
    zipPromise(macNim, 'node-nim-mac.zip'),
    zipPromise(macArmNim, 'node-nim-mac-arm.zip'),
    zipPromise(linux64Nim, 'node-nim-linux64.zip')
  ]);
}

build();