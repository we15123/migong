# 11岁儿童迷宫生成器

这是一个为11岁儿童设计的迷宫生成器，可以创建A4纸大小的迷宫PDF，适合打印出来供孩子们玩耍。

## 功能特点

- 生成适合11岁儿童难度的迷宫
- 自动调整迷宫尺寸以适应A4纸张
- 可以显示/隐藏迷宫解答路径
- 支持打印迷宫
- 可以导出为PDF文件

## 使用方法

1. 打开`index.html`文件
2. 点击"生成新迷宫"按钮可以创建不同的迷宫
3. 点击"显示答案"可以查看迷宫的解答路径
4. 点击"打印迷宫"可以打印当前显示的迷宫
5. 点击"导出PDF"可以将迷宫导出为PDF文件

## 如何打印

迷宫设计为A4纸张大小（210mm × 297mm），打印时请确保：

1. 在打印设置中选择"实际大小"或"100%缩放"
2. 页面方向设置为"纵向"
3. 纸张大小选择A4

## 技术说明

项目使用以下技术：

- HTML5
- CSS3
- JavaScript (ES6)
- html2pdf.js（用于PDF导出）

迷宫使用深度优先搜索算法生成，确保每个迷宫都有唯一的解答路径。

## 目录结构

```
├── index.html            # 主页面
├── src/                  # 源代码目录
│   ├── css/              # 样式文件
│   │   └── style.css     # 主样式表
│   └── js/               # JavaScript文件
│       └── maze.js       # 迷宫生成逻辑
└── README.md             # 说明文档
```

## 离线使用

如果需要离线使用，请下载html2pdf.js库并修改index.html中的引用路径：

1. 下载 [html2pdf.js](https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js)
2. 将文件保存到项目的`src/js`目录下
3. 修改index.html中的引用：
   ```html
   <script src="src/js/html2pdf.bundle.min.js"></script>
   ```

## 注意事项

- 使用现代浏览器（如Chrome、Firefox、Edge等）以获得最佳体验
- 打印或导出PDF前，建议先隐藏答案路径
- 如果迷宫显示不完整，可能需要调整浏览器的缩放比例 