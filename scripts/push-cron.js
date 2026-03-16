#!/usr/bin/env node

/**
 * LeetCode 每日一题推送脚本（Cron 版本）
 * 获取题目信息，生成题解模板，输出推送消息
 * 由 OpenClaw cron 的 delivery 配置负责推送到群聊
 */

const { execSync } = require('child_process');
const path = require('path');

const WORKSPACE = '/Users/openclaw/.openclaw/workspace/leetcode-daily';

console.log('📝 LeetCode 每日一题推送');
console.log('---');

try {
  // 1. 获取今日题目
  console.log('📡 获取今日题目...');
  const fetchOutput = execSync(`node ${WORKSPACE}/scripts/fetch-daily-problem.js --json 2>&1`, {
    cwd: WORKSPACE,
    encoding: 'utf-8'
  });

  // 解析 JSON 输出
  const jsonStart = fetchOutput.indexOf('{');
  const jsonEnd = fetchOutput.lastIndexOf('}') + 1;
  const problem = JSON.parse(fetchOutput.slice(jsonStart, jsonEnd));
  const stats = JSON.parse(problem.stats);

  console.log(`✓ 题目：#${problem.question_id} ${problem.title}`);
  console.log(`  难度：${problem.difficulty}`);

  // 2. 生成题解模板
  console.log('\n📝 生成题解模板...');
  try {
    execSync(`node ${WORKSPACE}/scripts/generate-solution.js --id ${problem.question_id} --title "${problem.title}" --difficulty ${problem.difficulty} --tags "${problem.tags.join(',')}" 2>&1`, {
      cwd: WORKSPACE,
      encoding: 'utf-8'
    });
    console.log('✓ 题解模板已生成');
  } catch (err) {
    console.log('⚠ 题解模板生成失败，继续推送');
  }

  // 3. 构建推送消息
  const difficultyEmoji = {
    'Easy': '🟢',
    'Medium': '🟡',
    'Hard': '🔴'
  };

  const message = `📝 *LeetCode 每日一题 - ${problem.date}*

#${problem.question_id} - ${problem.title}
难度：${difficultyEmoji[problem.difficulty] || '⚪'} ${problem.difficulty}
标签：${problem.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')}

👍 ${problem.likes} | 👎 ${problem.dislikes} | 通过率：${stats.acRate || 'N/A'}

🔗 https://leetcode.cn/problems/${problem.title_slug}/

${problem.hints?.length ? `💡 *提示：*\n${problem.hints.slice(0, 2).map(h => `- ${h}`).join('\n')}\n` : ''}---
_自动推送 by EllaBot 🤖_`;

  // 4. 提交到 Git
  console.log('\n💾 提交到 Git...');
  try {
    execSync('git add .', { cwd: WORKSPACE, stdio: 'pipe' });
    const commitResult = execSync(`git commit -m "Daily: ${problem.date} - #${problem.question_id}" 2>&1`, {
      cwd: WORKSPACE,
      encoding: 'utf-8'
    });
    execSync('git push origin main', { cwd: WORKSPACE, stdio: 'pipe' });
    console.log('✓ Git 提交成功');
  } catch (err) {
    console.log('⚠ Git 提交失败（可能没有变更）');
  }

  // 5. 输出消息（由 cron delivery 推送）
  console.log('\n---');
  console.log('📤 推送消息：');
  console.log(message);

} catch (err) {
  console.error('❌ 推送失败:', err.message);
  process.exit(1);
}
