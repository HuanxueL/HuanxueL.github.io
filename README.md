# HuanxueL.github.io

这是一个可直接部署到 GitHub Pages 的个人网站模板（纯 HTML/CSS/JS，无需构建工具）。页面包含：
About Me / Education / Relevant Courses / Certifications / Projects / Publications / Contact。

## 如何修改内容

所有内容都在 `data/` 目录下的 JSON 文件里，改完保存即可：

- `data/profile.json`：个人信息、Education、Contact
- `data/courses.json`：课程
- `data/certs.json`：证书
- `data/projects.json`：项目
- `data/publications.json`：论文/出版物

## GitHub Pages 部署

1. 在 GitHub 新建仓库：`HuanxueL.github.io`（必须同名才能用 `https://HuanxueL.github.io/`）  
2. 把本目录内容推送到该仓库的 `main` 分支根目录  
3. GitHub 仓库 Settings → Pages → Build and deployment：选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`  
4. 访问：`https://HuanxueL.github.io/`

## 本地预览（可选）

任意静态服务器都可以，例如：

```bash
python -m http.server 4173
```

然后打开 `http://localhost:4173/`。
