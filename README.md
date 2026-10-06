# 个人网站

一个纯静态的一页式个人主页，深色科技风。没有构建步骤、没有依赖，改完直接 push 就能上线。

访问地址：<https://1zte1.github.io>

## 目录结构

```
.
├── index.html              # 页面骨架（含结构注释，一般不用改）
├── assets/
│   ├── css/style.css       # 样式（想换主题色改 :root 里的 --c1/--c2/--c3）
│   ├── js/
│   │   ├── content.js      # ★ 所有文字内容都在这里，你只需要改这个文件
│   │   └── main.js         # 渲染与交互逻辑（不用改）
│   └── img/
│       └── favicon.svg     # 浏览器标签页图标
├── .nojekyll               # 告诉 GitHub Pages 不要用 Jekyll 处理
└── README.md
```

## 怎么改内容

**只改 `assets/js/content.js`**，里面每一段都有中文注释说明。

规则就三条：

1. 只改**引号里面**的文字。
2. 不要删掉引号 `""`、逗号 `,`、大括号 `{}`、方括号 `[]`。
3. 想加一条内容，照着已有的整段复制，用逗号隔开。

改完双击 `index.html` 在浏览器里看效果。

### 换头像

1. 把图片放进 `assets/img/`，比如 `assets/img/avatar.png`
2. 在 `content.js` 里把 `avatarImage: ""` 改成 `avatarImage: "./assets/img/avatar.png"`

> 建议用正方形图片（≥ 500×500），显示时会被裁成圆形。

### 换主题色

打开 `assets/css/style.css`，改最上面 `:root` 里这三行：

```css
--c1: #22d3ee;   /* 青 */
--c2: #6366f1;   /* 蓝紫 */
--c3: #a855f7;   /* 紫 */
```

## 怎么发布

改完内容后，在本文件夹执行：

```bash
git add -A
git commit -m "更新网站内容"
git push
```

推送后等 1～2 分钟，GitHub Pages 会自动重新构建，刷新线上地址即可看到更新。

## 本地预览

直接双击 `index.html` 即可。如果要用本地服务器：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```
