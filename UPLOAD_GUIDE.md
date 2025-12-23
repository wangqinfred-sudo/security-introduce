# 项目上传指南

本指南将帮助你将安全介绍项目上传到Git仓库（GitHub/GitLab/Gitee等）。

## 步骤1：创建远程仓库

首先，在你选择的Git平台（GitHub/GitLab/Gitee）上创建一个新的仓库。

### GitHub
1. 登录GitHub账号
2. 点击右上角的"+"号，选择"New repository"
3. 填写仓库名称（如"security-introduce"）
4. 选择仓库可见性（Public/Private）
5. 点击"Create repository"

### GitLab
1. 登录GitLab账号
2. 点击左上角的"New project"
3. 选择"Create blank project"
4. 填写项目名称和路径
5. 点击"Create project"

### Gitee
1. 登录Gitee账号
2. 点击右上角的"+"号，选择"新建仓库"
3. 填写仓库信息
4. 点击"创建"

## 步骤2：连接本地仓库与远程仓库

在项目根目录执行以下命令：

```bash
# 替换为你的远程仓库URL
git remote add origin https://github.com/yourusername/security-introduce.git
```

## 步骤3：检查远程仓库连接

```bash
git remote -v
```

## 步骤4：添加文件到暂存区

```bash
# 添加所有文件（包括新文件和修改过的文件）
git add .

# 或者添加特定文件
git add account-security-detail.html styles.css ...
```

## 步骤5：提交文件

```bash
git commit -m "Initial commit: 安全介绍网站"
```

## 步骤6：推送文件到远程仓库

```bash
git push -u origin main
```

## 常见问题解决

### 1. 权限问题
如果推送时遇到权限错误，可能需要设置SSH密钥或使用个人访问令牌。

### 2. 本地分支与远程分支不一致
如果远程仓库已有文件，需要先拉取再推送：

```bash
git pull origin main --rebase
git push -u origin main
```

### 3. 文件过大
如果有大文件无法推送，可以使用Git LFS：

```bash
# 安装Git LFS
brew install git-lfs

# 初始化Git LFS
git lfs install

# 跟踪大文件类型
git lfs track "*.mp4"
git lfs track "*.png"
```

## 查看上传结果

上传完成后，你可以在远程仓库页面查看所有文件。其他人可以通过克隆或访问仓库URL来查看你的项目。

```bash
# 克隆仓库（其他人可以使用）
git clone https://github.com/yourusername/security-introduce.git
```

## 后续更新

当你修改项目后，可以通过以下命令更新远程仓库：

```bash
git add .
git commit -m "更新内容描述"
git push
```