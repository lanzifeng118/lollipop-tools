# Lollipop Tools

基于 pnpm、Changesets 和 Turborepo 的 monorepo 项目，用于管理 npm 包。

## 项目结构

- `packages/`: 包含所有共享包
  - `cli/`: 命令行工具
- `apps/`: 包含使用这些包的应用程序
  - `demo/`: 展示包功能的演示应用

## 开始使用

### 前置条件

- [Node.js](https://nodejs.org/) (v16 或更高版本)
- [pnpm](https://pnpm.io/) (v9 或更高版本)

### 安装

```bash
# 安装依赖
pnpm install
```

### 开发

```bash
# 构建所有包
pnpm build

# 运行开发模式
pnpm dev

# 运行测试
pnpm test

# 清理构建文件
pnpm clean

# 格式化代码
pnpm format
```

## 发布流程

本项目使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理和包发布。

### 创建变更集

```bash
pnpm changeset
```

这将提示您选择哪些包已更改以及需要什么类型的版本变更（主要版本、次要版本、补丁版本）。

### 更新包版本

```bash
pnpm version
```

这将根据变更集更新包的版本。

### 发布包

```bash
pnpm publish
```

这将把包发布到 npm。

## 许可证

ISC
