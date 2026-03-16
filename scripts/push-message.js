#!/usr/bin/env node

/**
 * LeetCode 每日一题推送脚本（简化版）
 * 直接输出推送内容，由调用方处理发送
 */

const { execSync } = require('child_process');

const WORKSPACE = '/Users/openclaw/.openclaw/workspace/leetcode-daily';

// 获取今日题目
const fetchOutput = execSync(`node ${WORKSPACE}/scripts/fetch-daily-problem.js --json 2>&1`, {
  cwd: WORKSPACE,
  encoding: 'utf-8'
});

// 解析 JSON 输出（找到第一个 { 到最后一个 }）
const jsonStart = fetchOutput.indexOf('{');
const jsonEnd = fetchOutput.lastIndexOf('}') + 1;
const problem = JSON.parse(fetchOutput.slice(jsonStart, jsonEnd));
const stats = JSON.parse(problem.stats);

// 难度表情
const emoji = {
  'Easy': '🟢',
  'Medium': '🟡',
  'Hard': '🔴'
};

// 构建消息
const message = `📝 *LeetCode 每日一题 - ${problem.date}*

#${problem.question_id} - ${problem.title}
难度：${emoji[problem.difficulty] || '⚪'} ${problem.difficulty}
标签：${problem.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')}

👍 ${problem.likes} | 👎 ${problem.dislikes} | 通过率：${stats.acRate || 'N/A'}

🔗 https://leetcode.cn/problems/${problem.title_slug}/

${problem.hints?.length ? `💡 *提示：*\n${problem.hints.slice(0, 2).map(h => `- ${h}`).join('\n')}\n` : ''}
---
_自动推送 by EllaBot 🤖_`;

// 输出
console.log(message);
