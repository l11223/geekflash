# GeekFlash ⚡

macOS 桌面 EDL 刷机工具 — 联想 Y700 四代（TB322FC）专用

基于 Tauri 2 + React + TypeScript + shadcn/ui 构建，深色主题，轻量原生。

## 功能

- 🔥 一键刷入 Patched Boot（9008 EDL 模式）
- 🔄 一键恢复原厂 Boot（救砖）
- 💾 GPT Slot 修复（卡 fastboot 救砖）
- 🔐 AVB 签名工具（BL 锁定状态下刷入）
- 📡 自动检测 9008 EDL / Fastboot 设备连接
- 📋 实时命令日志输出
- 💾 配置持久化（记住文件路径）

## 前置要求

- macOS
- [edl](https://github.com/bkerler/edl) — `pip3 install edl`
- fastboot（Android Platform Tools）
- python3（用于 AVB 签名）

## 安装

从 [Releases](../../releases) 下载最新的 `.dmg` 文件，双击安装即可。

## 本地开发

```bash
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

产物在 `src-tauri/target/release/bundle/` 下。

## License

MIT
