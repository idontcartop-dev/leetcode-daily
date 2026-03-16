#!/usr/bin/env node

/**
 * LeetCode Daily Stats Generator
 * 
 * 统计解题数据并生成报告：
 * - 解题数量
 * - 难度分布
 * - 标签分布
 * - 连续打卡天数
 * 
 * 输出：
 * - stats/summary.json - 汇总数据（供图表使用）
 * - stats/streak.json - 连续打卡数据
 * - stats/report.md - Markdown 格式报告
 */

const fs = require('fs');
const path = require('path');

// 配置
const WORKSPACE = path.join(__dirname, '..');
const PROBLEMS_DIR = path.join(WORKSPACE, 'problems');
const STATS_DIR = path.join(WORKSPACE, 'stats');

// 确保 stats 目录存在
if (!fs.existsSync(STATS_DIR)) {
  fs.mkdirSync(STATS_DIR, { recursive: true });
}

/**
 * 解析题目文件
 * @param {string} filePath - 题目文件路径
 * @returns {object|null} - 解析后的题目数据
 */
function parseProblemFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 提取元数据
    const titleMatch = content.match(/^#\s+(.+)/m);
    const idMatch = content.match(/\*\*题号\*\*:\s*\[?(\d+|[\w-]+)\]?/i);
    const difficultyMatch = content.match(/\*\*难度\*\*:\s*\[?(\w+)\]?/i);
    const dateMatch = content.match(/\*\*日期\*\*:\s*(\d{4}-\d{2}-\d{2})/i);
    const tagsMatch = content.match(/\*\*标签\*\*:\s*(.+)/i);
    
    if (!titleMatch || !dateMatch) {
      return null;
    }
    
    // 解析标签
    let tags = [];
    if (tagsMatch) {
      tags = tagsMatch[1]
        .split('#')
        .filter(t => t.trim())
        .map(t => t.trim());
    }
    
    return {
      file: path.basename(filePath),
      title: titleMatch[1].trim(),
      id: idMatch ? idMatch[1] : 'unknown',
      difficulty: difficultyMatch ? difficultyMatch[1].toLowerCase() : 'unknown',
      date: dateMatch[1],
      tags: tags
    };
  } catch (error) {
    console.error(`解析文件失败 ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 扫描所有题目文件
 * @returns {Array} - 题目数据数组
 */
function scanProblems() {
  if (!fs.existsSync(PROBLEMS_DIR)) {
    console.warn(`problems 目录不存在：${PROBLEMS_DIR}`);
    return [];
  }
  
  const files = fs.readdirSync(PROBLEMS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();
  
  const problems = [];
  for (const file of files) {
    const filePath = path.join(PROBLEMS_DIR, file);
    const data = parseProblemFile(filePath);
    if (data) {
      problems.push(data);
    }
  }
  
  return problems;
}

/**
 * 计算连续打卡天数
 * @param {Array} problems - 题目数据数组（按日期排序）
 * @returns {object} - 连续打卡数据
 */
function calculateStreak(problems) {
  if (problems.length === 0) {
    return {
      current: 0,
      max: 0,
      startDate: null,
      endDate: null,
      history: []
    };
  }
  
  // 按日期排序
  const sorted = [...problems].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let streakHistory = [];
  let currentStartDate = null;
  let currentEndDate = null;
  
  // 检查最新的一天是否是今天或昨天
  const latestDate = new Date(sorted[0].date);
  latestDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    // 断签了
    currentStreak = 0;
  } else {
    // 计算当前连续天数
    let expectedDate = new Date(latestDate);
    
    for (let i = 0; i < sorted.length; i++) {
      const problemDate = new Date(sorted[i].date);
      problemDate.setHours(0, 0, 0, 0);
      
      const expectedDiff = Math.floor((expectedDate - problemDate) / (1000 * 60 * 60 * 24));
      
      if (expectedDiff === 0) {
        // 连续的一天
        tempStreak++;
        if (i === sorted.length - 1) {
          currentStartDate = sorted[i].date;
        }
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (expectedDiff > 0) {
        // 有间隔，重置
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
        tempStreak = 1;
        expectedDate = new Date(problemDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      }
    }
    
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    
    if (diffDays === 0 || diffDays === 1) {
      currentStreak = tempStreak;
      currentEndDate = sorted[0].date;
      
      // 找到当前连续的起始日期
      for (let i = sorted.length - 1; i >= 0; i--) {
        const problemDate = new Date(sorted[i].date);
        const prevDate = i < sorted.length - 1 ? new Date(sorted[i + 1].date) : null;
        
        if (prevDate) {
          const gap = Math.floor((problemDate - prevDate) / (1000 * 60 * 60 * 24));
          if (gap > 1) {
            currentStartDate = sorted[i].date;
            break;
          }
        }
        
        if (i === 0) {
          currentStartDate = sorted[i].date;
        }
      }
    }
  }
  
  // 生成历史数据（每月的打卡天数）
  const monthlyHistory = {};
  for (const problem of problems) {
    const month = problem.date.substring(0, 7); // YYYY-MM
    if (!monthlyHistory[month]) {
      monthlyHistory[month] = 0;
    }
    monthlyHistory[month]++;
  }
  
  return {
    current: currentStreak,
    max: maxStreak,
    startDate: currentStartDate,
    endDate: currentEndDate,
    history: monthlyHistory
  };
}

/**
 * 统计难度分布
 * @param {Array} problems - 题目数据数组
 * @returns {object} - 难度分布
 */
function countDifficulty(problems) {
  const distribution = {
    easy: 0,
    medium: 0,
    hard: 0,
    unknown: 0
  };
  
  for (const problem of problems) {
    const diff = problem.difficulty.toLowerCase();
    if (distribution.hasOwnProperty(diff)) {
      distribution[diff]++;
    } else {
      distribution.unknown++;
    }
  }
  
  return distribution;
}

/**
 * 统计标签分布
 * @param {Array} problems - 题目数据数组
 * @returns {object} - 标签分布
 */
function countTags(problems) {
  const tagCount = {};
  
  for (const problem of problems) {
    for (const tag of problem.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }
  
  // 按数量排序
  const sorted = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1]);
  
  return Object.fromEntries(sorted);
}

/**
 * 生成汇总数据
 * @param {Array} problems - 题目数据数组
 * @param {object} streak - 连续打卡数据
 * @returns {object} - 汇总数据
 */
function generateSummary(problems, streak) {
  const difficulty = countDifficulty(problems);
  const tags = countTags(problems);
  
  // 按日期排序
  const sortedByDate = [...problems].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  return {
    generatedAt: new Date().toISOString(),
    total: problems.length,
    difficulty: difficulty,
    tags: tags,
    streak: {
      current: streak.current,
      max: streak.max
    },
    firstProblem: sortedByDate.length > 0 ? sortedByDate[0].date : null,
    lastProblem: sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1].date : null,
    topTags: Object.entries(tags).slice(0, 10).map(([tag, count]) => ({ tag, count }))
  };
}

/**
 * 生成 ASCII 条形图
 * @param {number} value - 值
 * @param {number} max - 最大值
 * @param {number} width - 条形宽度
 * @returns {string} - ASCII 条形
 */
function asciiBar(value, max, width = 20) {
  if (max === 0) return '';
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/**
 * 生成 Markdown 报告
 * @param {object} summary - 汇总数据
 * @param {object} streak - 连续打卡数据
 * @returns {string} - Markdown 报告
 */
function generateReport(summary, streak) {
  const lines = [];
  
  lines.push('# 📊 LeetCode 解题统计报告');
  lines.push('');
  lines.push(`*生成时间：${new Date(summary.generatedAt).toLocaleString('zh-CN')}*`);
  lines.push('');
  
  // 总览
  lines.push('## 📈 总览');
  lines.push('');
  lines.push(`- **总解题数**: ${summary.total}`);
  lines.push(`- **开始日期**: ${summary.firstProblem || '暂无'}`);
  lines.push(`- **最近解题**: ${summary.lastProblem || '暂无'}`);
  lines.push('');
  
  // 连续打卡
  lines.push('## 🔥 连续打卡');
  lines.push('');
  lines.push(`- **当前连续**: ${streak.current} 天`);
  lines.push(`- **最长连续**: ${streak.max} 天`);
  if (streak.current > 0) {
    lines.push(`- **连续期间**: ${streak.startDate} ~ ${streak.endDate}`);
  }
  lines.push('');
  
  // 难度分布
  lines.push('## 📊 难度分布');
  lines.push('');
  const diffTotal = summary.total || 1;
  const diffBars = [
    { label: 'Easy', value: summary.difficulty.easy, color: '🟢' },
    { label: 'Medium', value: summary.difficulty.medium, color: '🟡' },
    { label: 'Hard', value: summary.difficulty.hard, color: '🔴' }
  ];
  
  const maxDiff = Math.max(...diffBars.map(d => d.value));
  for (const d of diffBars) {
    const pct = ((d.value / diffTotal) * 100).toFixed(1);
    const bar = asciiBar(d.value, maxDiff, 20);
    lines.push(`${d.color} **${d.label}**: ${d.value} (${pct}%)`);
    if (maxDiff > 0) {
      lines.push(`   \`${bar}\``);
    }
  }
  lines.push('');
  
  // 标签分布（Top 10）
  lines.push('## 🏷️ 标签分布 (Top 10)');
  lines.push('');
  const topTags = summary.topTags || [];
  if (topTags.length === 0) {
    lines.push('*暂无标签数据*');
  } else {
    const maxTag = topTags[0]?.count || 1;
    for (const { tag, count } of topTags) {
      const pct = ((count / summary.total) * 100).toFixed(1);
      const bar = asciiBar(count, maxTag, 15);
      lines.push(`- **#${tag}**: ${count} (${pct}%) \`${bar}\``);
    }
  }
  lines.push('');
  
  // 月度打卡历史
  lines.push('## 📅 月度打卡历史');
  lines.push('');
  const historyEntries = Object.entries(streak.history || {}).sort();
  if (historyEntries.length === 0) {
    lines.push('*暂无历史数据*');
  } else {
    lines.push('| 月份 | 解题数 |');
    lines.push('|------|--------|');
    for (const [month, count] of historyEntries) {
      lines.push(`| ${month} | ${count} |`);
    }
  }
  lines.push('');
  
  // 图表集成提示
  lines.push('---');
  lines.push('');
  lines.push('## 📈 图表数据');
  lines.push('');
  lines.push('> 💡 后续可集成 Chart.js 或其他可视化工具');
  lines.push('> 数据文件：`stats/summary.json`, `stats/streak.json`');
  lines.push('');
  lines.push('### 难度分布 (Chart.js 示例)');
  lines.push('```javascript');
  lines.push('const difficultyData = {');
  lines.push('  labels: [\'Easy\', \'Medium\', \'Hard\'],');
  lines.push(`  values: [${summary.difficulty.easy}, ${summary.difficulty.medium}, ${summary.difficulty.hard}]`);
  lines.push('};');
  lines.push('```');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 扫描题目文件...');
  const problems = scanProblems();
  console.log(`📚 找到 ${problems.length} 道题目`);
  
  if (problems.length === 0) {
    console.log('⚠️ 暂无题目数据，生成空报告');
  }
  
  console.log('🔥 计算连续打卡...');
  const streak = calculateStreak(problems);
  
  console.log('📊 生成汇总数据...');
  const summary = generateSummary(problems, streak);
  
  // 写入 summary.json
  const summaryPath = path.join(STATS_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ 已保存：${summaryPath}`);
  
  // 写入 streak.json
  const streakPath = path.join(STATS_DIR, 'streak.json');
  fs.writeFileSync(streakPath, JSON.stringify(streak, null, 2));
  console.log(`✅ 已保存：${streakPath}`);
  
  // 生成并写入报告
  console.log('📝 生成 Markdown 报告...');
  const report = generateReport(summary, streak);
  const reportPath = path.join(STATS_DIR, 'report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`✅ 已保存：${reportPath}`);
  
  // 打印摘要
  console.log('');
  console.log('📋 统计摘要:');
  console.log(`   总解题数：${summary.total}`);
  console.log(`   当前连续：${streak.current} 天`);
  console.log(`   最长连续：${streak.max} 天`);
  console.log(`   难度分布：Easy=${summary.difficulty.easy}, Medium=${summary.difficulty.medium}, Hard=${summary.difficulty.hard}`);
  console.log('');
  console.log('🎉 统计完成！');
}

// 运行
main();
