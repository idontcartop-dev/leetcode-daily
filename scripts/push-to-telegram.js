#!/usr/bin/env node

/**
 * LeetCode 每日一题推送脚本
 * 获取题目信息并推送到 Telegram 群聊
 */

const { execSync } = require('child_process');
const path = require('path');

// 配置
const CHANNEL_ID = process.env.LEETCODE_CHANNEL || '-1003770896586';
const WORKSPACE = '/Users/openclaw/.openclaw/workspace/leetcode-daily';

// 解析命令行参数
const args = process.argv.slice(2);
const channelArg = args.find(a => a.startsWith('--channel='));
const channel = channelArg ? channelArg.split('=')[1] : CHANNEL_ID;

console.log(`📝 LeetCode 每日推送`);
console.log(`目标渠道：${channel}`);
console.log('---');

// 1. 获取今日题目
console.log('📡 获取今日题目...');
const fetchOutput = execSync(`node ${WORKSPACE}/scripts/fetch-daily-problem.js --json`, {
  cwd: WORKSPACE,
  encoding: 'utf-8'
});

// 解析 JSON 输出（跳过日志行）
const jsonLines = fetchOutput.split('\n').filter(line => line.trim().startsWith('{'));
const problemData = JSON.parse(jsonLines.join('\n'));

console.log(`✓ 题目：#${problemData.question_id} ${problemData.title}`);
console.log(`  难度：${problemData.difficulty}`);

// 2. 生成题解模板
console.log('\n📝 生成题解模板...');
try {
  execSync(`node ${WORKSPACE}/scripts/generate-solution.js --id ${problemData.question_id} --title "${problemData.title}" --difficulty ${problemData.difficulty} --tags "${problemData.tags.join(',')}"`, {
    cwd: WORKSPACE,
    encoding: 'utf-8',
    stdio: 'inherit'
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

const stats = JSON.parse(problemData.stats);
const message = `📝 *LeetCode 每日一题 - ${problemData.date}*

#${problemData.question_id} - ${problemData.title}
难度：${difficultyEmoji[problemData.difficulty] || '⚪'} ${problemData.difficulty}
标签：${problemData.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')}

👍 ${problemData.likes} | 👎 ${problemData.dislikes} | 通过率：${stats.acRate || 'N/A'}

🔗 https://leetcode.cn/problems/${problemData.title_slug}/

💡 *提示：*
${problemData.hints?.slice(0, 2).map(h => `- ${h}`).join('\n') || '暂无提示'}

---
_自动推送 by EllaBot 🤖_`;

// 4. 推送到 Telegram
console.log('\n📤 推送到 Telegram...');

const telegramMessage = {
  action: 'send',
  channel: 'telegram',
  target: channel,
  message: message,
  parse_mode: 'Markdown'
};

// 使用 OpenClaw message 工具推送
const { spawn } = require('child_process');
const messageProcess = spawn('openclaw', ['message', 'send', '--target', channel, '--message', message]);

messageProcess.stdout.on('data', (data) => {
  console.log(`推送结果：${data}`);
});

messageProcess.stderr.on('data', (data) => {
  console.error(`推送错误：${data}`);
});

messageProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 推送成功！');
  } else {
    console.log(`\n⚠ 推送完成（退出码：${code}）`);
  }
  
  // 5. 提交到 Git
  console.log('\n💾 提交到 Git...');
  try {
    execSync('git add .', { cwd: WORKSPACE, stdio: 'pipe' });
    execSync(`git commit -m "Daily: ${problemData.date} - #${problemData.question_id} ${problemData.title}"`, {
      cwd: WORKSPACE,
      stdio: 'pipe'
    });
    execSync('git push origin main', { cwd: WORKSPACE, stdio: 'pipe' });
    console.log('✓ Git 提交成功');
  } catch (err) {
    console.log('⚠ Git 提交失败（可能没有变更）');
  }
});
