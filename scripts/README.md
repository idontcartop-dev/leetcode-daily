# LeetCode 题解模板生成器

自动生成 LeetCode 题解文件的 Node.js 脚本，支持多语言代码模板和日期自动命名。

## 功能特性

- ✅ 基于模板自动生成题解文件
- ✅ 支持多种编程语言（Python / JavaScript / Java）
- ✅ 自动日期命名（YYYY-MM-DD）
- ✅ 安全的文件名生成（支持中文标题）
- ✅ 命令行界面，易于集成到工作流
- ✅ 支持批量生成

## 安装

无需额外依赖，使用 Node.js 内置模块。

```bash
# 确保脚本有执行权限
chmod +x generate-solution.js
```

## 使用方法

### 基础用法

```bash
# 生成 Python 题解（默认）
node generate-solution.js --id 1 --title "两数之和"
```

### 多语言支持

```bash
# 生成多种语言的题解
node generate-solution.js --id 1 --title "两数之和" --lang python --lang javascript --lang java
```

### 完整参数

```bash
node generate-solution.js \
  --id 1 \
  --title "两数之和" \
  --difficulty Easy \
  --lang python \
  --lang javascript \
  --desc "给定一个整数数组 nums 和一个整数目标值 target..." \
  --thought "使用哈希表存储已遍历的数字" \
  --tags "数组，哈希表" \
  --notes "注意边界条件" \
  --output ./custom-output \
  --filename "001-two-sum.md"
```

### 参数说明

| 参数 | 说明 | 必需 | 默认值 |
|------|------|------|--------|
| `--id` | 题目编号 | ✅ | - |
| `--title` | 题目名称 | ✅ | - |
| `--difficulty` | 难度级别 | ❌ | Medium |
| `--lang` | 编程语言（可重复） | ❌ | python |
| `--desc` | 题目描述 | ❌ | 暂无题目描述 |
| `--thought` | 解题思路 | ❌ | 待补充解题思路 |
| `--tags` | 标签（逗号分隔） | ❌ | #算法 |
| `--notes` | 个人笔记 | ❌ | 暂无笔记 |
| `--output` | 输出目录 | ❌ | ./solutions |
| `--filename` | 自定义文件名 | ❌ | {id}-{title}.md |

### 支持的语言

- `python` - Python 3
- `javascript` - JavaScript (ES6+)
- `java` - Java

## 输出示例

生成的 Markdown 文件结构：

```markdown
# 两数之和

**题号**: 1  
**难度**: Easy  
**日期**: 2026-03-16  
**标签**: #数组 #哈希表

---

## 题目描述

[题目内容]

---

## 思路

[解题思路]

---

## 代码实现

```python
class Solution:
    def solve(self):
        pass
```

```javascript
var solve = function(nums) {
    // TODO
};
```

---

## 复杂度分析

- 时间复杂度：O(?)
- 空间复杂度：O(?)

---

## 笔记

[个人笔记]
```

## 编程式使用

```javascript
const generator = require('./generate-solution.js');

// 单个生成
const result = generator.generateSolution({
  problemId: '1',
  problemTitle: '两数之和',
  difficulty: 'Easy',
  description: '题目描述...',
  thought: '解题思路...',
  tags: ['数组', '哈希表'],
  notes: '笔记...'
}, {
  languages: ['python', 'javascript'],
  outputDir: './solutions',
  filename: '001-two-sum.md'
});

console.log(result.filepath); // 输出文件路径

// 批量生成
const problems = [
  { problemId: '1', problemTitle: '两数之和', difficulty: 'Easy' },
  { problemId: '2', problemTitle: '两数相加', difficulty: 'Medium' }
];

const results = generator.batchGenerate(problems, {
  languages: ['python']
});
```

## 文件结构

```
leetcode-daily/
├── templates/
│   └── solution-template.md    # 题解模板
├── scripts/
│   └── generate-solution.js    # 生成器脚本
├── solutions/                   # 生成的题解文件
│   ├── 1-两数之和.md
│   └── ...
└── README.md
```

## 自定义模板

编辑 `templates/solution-template.md` 可以自定义输出格式。支持的占位符：

- `[题目名称]` - 题目标题
- `[编号]` - 题目编号
- `[Easy/Medium/Hard]` - 难度级别
- `YYYY-MM-DD` - 自动生成日期
- `#标签 1 #标签 2` - 标签列表
- `[题目内容]` - 题目描述
- `[解题思路]` - 解题思路
- `[个人笔记/踩坑点]` - 笔记
- 代码块部分会被自动替换为多语言代码

## 许可证

MIT
