# LeetCode Daily Challenge Fetcher

获取 LeetCode 每日一题信息的工具脚本。

## 功能

- ✅ 获取每日题目信息
- ✅ 支持题号、标题、难度、标签、题目描述
- ✅ 支持 JSON 和文本格式输出
- ✅ 可保存到文件

## 依赖

```bash
pip install requests
```

## 使用方法

### Python 脚本

```bash
# 基本使用（文本格式）
python scripts/fetch-daily-problem.py

# JSON 格式输出
python scripts/fetch-daily-problem.py --json

# 保存到文件
python scripts/fetch-daily-problem.py --save today.json

# JSON 格式并保存
python scripts/fetch-daily-problem.py --json --save today.json
```

### Node.js 脚本

```bash
# 基本使用
node scripts/fetch-daily-problem.js

# JSON 格式
node scripts/fetch-daily-problem.js --json
```

## 输出字段

| 字段 | 说明 |
|------|------|
| date | 日期 |
| question_id | 题号 |
| title | 标题 |
| difficulty | 难度 (Easy/Medium/Hard) |
| tags | 标签列表 |
| category | 分类 |
| likes | 点赞数 |
| dislikes | 踩数 |
| link | 题目链接 |
| content | 题目描述（HTML 格式） |
| hints | 提示 |
| stats | 统计数据（通过率等） |

## API 说明

使用 LeetCode GraphQL API:
- Endpoint: `https://leetcode.com/graphql`
- Query: `activeDailyCodingChallengeQuestion`

## 示例输出

```
============================================================
📅 LeetCode 每日一题
============================================================
日期：2026-03-16
题号：1878
标题：Get Biggest Three Rhombus Sums in a Grid
难度：Medium
分类：Algorithms
标签：Array, Math, Sorting, Heap (Priority Queue), Matrix, Prefix Sum
链接：https://leetcode.com/problems/get-biggest-three-rhombus-sums-in-a-grid/
👍 396 | 👎 577
```

## 注意事项

- 需要网络连接
- 无需 API Key
- 依赖 LeetCode 官方 API 稳定性

## 统计功能

运行统计脚本生成解题报告：

```bash
node scripts/generate-stats.js
```

输出文件：
- `stats/report.md` - Markdown 格式统计报告
- `stats/summary.json` - 汇总数据（供图表使用）
- `stats/streak.json` - 连续打卡数据

统计内容：
- 📈 解题总数
- 🔥 连续打卡天数
- 📊 难度分布（Easy/Medium/Hard）
- 🏷️ 标签分布
- 📅 月度打卡历史
