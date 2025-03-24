# Lollipop CLI

一个用于简化 Git 操作的命令行工具，特别是针对分支合并流程的优化。

## 安装

```bash
npm install -g lollipop-cli
# 或
yarn global add lollipop-cli
# 或
pnpm add -g lollipop-cli
```

## 功能特点

- 简化 Git 分支合并流程
- 自动处理合并冲突
- 支持本地和远程分支操作
- 友好的命令行界面和提示

## 使用方法

### 合并命令

将当前分支合并到目标分支：

```bash
lollipop merge [目标分支]
```

#### 选项

- `--reset`: 重置目标本地分支（如果存在）
- `--remote`: 合并到远程分支并推送
- `--auto-confirm`: 自动确认，不需要二次询问

#### 示例

```bash
# 将当前分支合并到 develop 分支
lollipop merge develop

# 将当前分支合并到 master 分支，并重置本地 master 分支
lollipop merge master --reset

# 将当前分支合并到远程 main 分支
lollipop merge main --remote

# 将当前分支合并到 release 分支，并自动确认
lollipop merge release --auto-confirm
```

## 工作流程

1. 检查并获取最新的远程分支信息
2. 确定目标分支（用户提供或通过交互式选择）
3. 确认合并操作
4. 如果需要，重置本地目标分支
5. 切换到目标分支
6. 执行合并操作
7. 如果有冲突，提供冲突解决流程
8. 如果指定了远程操作，推送更改到远程分支
9. 切换回原始分支

## 开发

```bash
# 克隆仓库
git clone <仓库地址>

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 本地测试
node ./dist/index.js merge
```

## 贡献

欢迎提交问题和拉取请求！

## 许可证

ISC
