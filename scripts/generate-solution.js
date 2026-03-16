#!/usr/bin/env node

/**
 * LeetCode 题解模板自动生成器
 * 
 * 根据题目数据自动生成填充好的题解文件
 * 支持多种语言模板（Python/JavaScript/Java）
 * 自动日期命名
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  templatesDir: path.join(__dirname, '..', 'templates'),
  outputDir: path.join(__dirname, '..', 'solutions'),
  templateFile: 'solution-template.md',
  supportedLanguages: ['python', 'javascript', 'java']
};

// 语言对应的代码块标记和默认代码
const LANGUAGE_TEMPLATES = {
  python: {
    name: 'Python',
    codeBlock: 'python',
    defaultCode: `class Solution:
    def solve(self):
        # TODO: 实现解题逻辑
        pass`
  },
  javascript: {
    name: 'JavaScript',
    codeBlock: 'javascript',
    defaultCode: `/**
 * @param {number[]} nums
 * @return {void}
 */
var solve = function(nums) {
    // TODO: 实现解题逻辑
};`
  },
  java: {
    name: 'Java',
    codeBlock: 'java',
    defaultCode: `class Solution {
    public void solve() {
        // TODO: 实现解题逻辑
    }
}`
  }
};

/**
 * 获取当前日期字符串 (YYYY-MM-DD)
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成安全的文件名
 */
function generateFilename(problemId, problemTitle) {
  // 将中文和特殊字符替换为连字符
  const safeTitle = problemTitle
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${problemId}-${safeTitle}.md`;
}

/**
 * 读取模板文件
 */
function readTemplate() {
  const templatePath = path.join(CONFIG.templatesDir, CONFIG.templateFile);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`模板文件不存在：${templatePath}`);
  }
  
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * 生成多语言代码块
 */
function generateCodeBlocks(languages, customCodes = {}) {
  const codeBlocks = [];
  
  languages.forEach(lang => {
    const langConfig = LANGUAGE_TEMPLATES[lang.toLowerCase()];
    if (langConfig) {
      const code = customCodes[lang.toLowerCase()] || langConfig.defaultCode;
      codeBlocks.push(`\n\`\`\`${langConfig.codeBlock}\n${code}\n\`\`\``);
    }
  });
  
  return codeBlocks.length > 0 ? codeBlocks.join('\n') : '';
}

/**
 * 填充模板
 */
function fillTemplate(template, problemData, languages = ['python']) {
  const {
    problemId,
    problemTitle,
    difficulty,
    description,
    tags = [],
    thought = '',
    notes = '',
    customCodes = {}
  } = problemData;
  
  const date = getCurrentDate();
  const tagsString = tags.length > 0 ? tags.map(t => `#${t}`).join(' ') : '#算法';
  
  // 生成多语言代码块
  const codeBlocks = generateCodeBlocks(languages, customCodes);
  
  // 替换模板中的占位符
  let filled = template
    .replace(/\[题目名称\]/g, problemTitle || '未命名题目')
    .replace(/\[编号\]/g, problemId || '未知')
    .replace(/\[Easy\/Medium\/Hard\]/g, difficulty || 'Medium')
    .replace(/YYYY-MM-DD/g, date)
    .replace(/#标签 1 #标签 2/g, tagsString)
    .replace(/\[题目内容\]/g, description || '暂无题目描述')
    .replace(/\[解题思路\]/g, thought || '待补充解题思路')
    .replace(/\[个人笔记\/踩坑点\]/g, notes || '暂无笔记')
    .replace(/- 时间复杂度：O\(\?\)/g, '- 时间复杂度：O(?) - 待分析')
    .replace(/- 空间复杂度：O\(\?\)/g, '- 空间复杂度：O(?) - 待分析');
  
  // 替换代码块部分（保留多语言支持）
  // 匹配从 "## 代码实现" 到下一个 "##" 之间的内容
  const codeSectionRegex = /(## 代码实现\n\n)([\s\S]*?)(\n---|\n\n##|\n\n$)/;
  const codeSectionMatch = filled.match(codeSectionRegex);
  if (codeSectionMatch && codeBlocks) {
    filled = filled.replace(codeSectionRegex, `$1${codeBlocks}$3`);
  }
  
  return filled;
}

/**
 * 生成题解文件
 */
function generateSolution(problemData, options = {}) {
  const {
    languages = ['python'],
    outputDir = CONFIG.outputDir,
    filename = null
  } = options;
  
  // 读取模板
  const template = readTemplate();
  
  // 填充模板
  const content = fillTemplate(template, problemData, languages);
  
  // 生成文件名
  const problemId = problemData.problemId || 'unknown';
  const problemTitle = problemData.problemTitle || 'solution';
  const finalFilename = filename || generateFilename(problemId, problemTitle);
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 写入文件
  const outputPath = path.join(outputDir, finalFilename);
  fs.writeFileSync(outputPath, content, 'utf-8');
  
  return {
    success: true,
    filepath: outputPath,
    filename: finalFilename,
    date: getCurrentDate()
  };
}

/**
 * 批量生成题解
 */
function batchGenerate(problems, options = {}) {
  const results = [];
  
  problems.forEach((problem, index) => {
    try {
      const result = generateSolution(problem, options);
      results.push({
        ...result,
        problemId: problem.problemId,
        error: null
      });
      console.log(`✓ [${index + 1}/${problems.length}] 已生成：${result.filename}`);
    } catch (error) {
      results.push({
        problemId: problem.problemId,
        success: false,
        error: error.message
      });
      console.error(`✗ [${index + 1}/${problems.length}] 生成失败：${problem.problemId} - ${error.message}`);
    }
  });
  
  return results;
}

/**
 * CLI 命令行支持
 */
function main() {
  const args = process.argv.slice(2);
  
  // 显示帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LeetCode 题解模板生成器

用法:
  node generate-solution.js [选项]

选项:
  --id <编号>          题目编号 (必需)
  --title <标题>       题目名称 (必需)
  --difficulty <难度>  难度级别 (Easy/Medium/Hard, 默认：Medium)
  --lang <语言>        编程语言，可重复指定 (python/javascript/java, 默认：python)
  --desc <描述>        题目描述
  --thought <思路>     解题思路
  --tags <标签>        标签，逗号分隔
  --notes <笔记>       个人笔记
  --output <目录>      输出目录 (默认：./solutions)
  --filename <文件名>  自定义文件名
  
示例:
  node generate-solution.js --id 1 --title "两数之和" --difficulty Easy --lang python --lang javascript
  node generate-solution.js --id 200 --title "回文数" --tags "数组，双指针" --desc "题目描述内容..."
  
`);
    process.exit(0);
  }
  
  // 解析命令行参数
  const parseArg = (flag) => {
    const index = args.indexOf(flag);
    if (index === -1) return null;
    return args[index + 1];
  };
  
  const parseAllArgs = (flag) => {
    const results = [];
    let index = args.indexOf(flag);
    while (index !== -1) {
      if (args[index + 1] && !args[index + 1].startsWith('--')) {
        results.push(args[index + 1]);
        index = args.indexOf(flag, index + 1);
      } else {
        break;
      }
    }
    return results;
  };
  
  const problemId = parseArg('--id');
  const problemTitle = parseArg('--title');
  const difficulty = parseArg('--difficulty') || 'Medium';
  const languages = parseAllArgs('--lang').length > 0 ? parseAllArgs('--lang') : ['python'];
  const description = parseArg('--desc');
  const thought = parseArg('--thought');
  const tags = parseArg('--tags') ? parseArg('--tags').split(',').map(t => t.trim()) : [];
  const notes = parseArg('--notes');
  const outputDir = parseArg('--output');
  const customFilename = parseArg('--filename');
  
  // 验证必需参数
  if (!problemId || !problemTitle) {
    console.error('错误：必须提供题目编号 (--id) 和题目名称 (--title)');
    console.error('使用 --help 查看帮助信息');
    process.exit(1);
  }
  
  // 验证语言支持
  const invalidLangs = languages.filter(lang => !CONFIG.supportedLanguages.includes(lang.toLowerCase()));
  if (invalidLangs.length > 0) {
    console.error(`错误：不支持的编程语言：${invalidLangs.join(', ')}`);
    console.error(`支持的语言：${CONFIG.supportedLanguages.join(', ')}`);
    process.exit(1);
  }
  
  // 生成题解
  const problemData = {
    problemId,
    problemTitle,
    difficulty,
    description,
    thought,
    tags,
    notes
  };
  
  const options = {};
  if (languages.length > 0) options.languages = languages;
  if (outputDir) options.outputDir = outputDir;
  if (customFilename) options.filename = customFilename;
  
  try {
    const result = generateSolution(problemData, options);
    console.log('\n✓ 题解文件生成成功!');
    console.log(`  文件路径：${result.filepath}`);
    console.log(`  文件名：${result.filename}`);
    console.log(`  日期：${result.date}`);
    console.log(`  语言：${languages.join(', ')}`);
  } catch (error) {
    console.error(`\n✗ 生成失败：${error.message}`);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  generateSolution,
  batchGenerate,
  fillTemplate,
  readTemplate,
  generateFilename,
  getCurrentDate,
  LANGUAGE_TEMPLATES,
  CONFIG
};

// 如果是直接执行则运行 CLI
if (require.main === module) {
  main();
}
