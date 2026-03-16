#!/usr/bin/env node
/**
 * LeetCode Daily Challenge Fetcher (Node.js 版本)
 * 
 * 获取 LeetCode 每日一题信息
 * 
 * 使用方法:
 *   node fetch-daily-problem.js
 *   node fetch-daily-problem.js --json
 */

const https = require('https');
const fs = require('fs');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const DAILY_CHALLENGE_QUERY = `
query questionOfToday {
    activeDailyCodingChallengeQuestion {
        date
        userStatus
        link
        question {
            title
            titleSlug
            content
            questionFrontendId
            difficulty
            likes
            dislikes
            categoryTitle
            topicTags {
                name
                slug
            }
            stats
            hints
            exampleTestcases
        }
    }
}
`;

/**
 * 发送 GraphQL 请求
 */
function fetchDailyProblem() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            query: DAILY_CHALLENGE_QUERY,
            variables: {}
        });

        const options = {
            hostname: 'leetcode.com',
            port: 443,
            path: '/graphql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://leetcode.com/',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    
                    if (jsonData.errors) {
                        console.error('API 错误:', jsonData.errors);
                        resolve(null);
                        return;
                    }

                    const dailyChallenge = jsonData.data?.activeDailyCodingChallengeQuestion;
                    
                    if (!dailyChallenge) {
                        console.error('未找到每日挑战题目');
                        resolve(null);
                        return;
                    }

                    const question = dailyChallenge.question || {};
                    
                    const problemInfo = {
                        date: dailyChallenge.date,
                        link: dailyChallenge.link,
                        question_id: question.questionFrontendId,
                        title: question.title,
                        title_slug: question.titleSlug,
                        difficulty: question.difficulty,
                        likes: question.likes,
                        dislikes: question.dislikes,
                        category: question.categoryTitle,
                        tags: (question.topicTags || []).map(tag => tag.name),
                        content: question.content,
                        hints: question.hints || [],
                        example_testcases: question.exampleTestcases,
                        stats: question.stats
                    };

                    resolve(problemInfo);
                    
                } catch (e) {
                    console.error('JSON 解析失败:', e.message);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('请求失败:', e.message);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * 清理 HTML 标签
 */
function stripHtml(html) {
    return html.replace(/<[^>]+>/g, '');
}

/**
 * 格式化输出
 */
function formatOutput(problemInfo, asJson = false) {
    if (asJson) {
        const outputInfo = { ...problemInfo };
        outputInfo.content = outputInfo.content ? outputInfo.content.substring(0, 200) + '...' : null;
        console.log(JSON.stringify(outputInfo, null, 2));
    } else {
        console.log('='.repeat(60));
        console.log('📅 LeetCode 每日一题');
        console.log('='.repeat(60));
        console.log(`日期：${problemInfo.date || 'N/A'}`);
        console.log(`题号：${problemInfo.question_id || 'N/A'}`);
        console.log(`标题：${problemInfo.title || 'N/A'}`);
        console.log(`难度：${problemInfo.difficulty || 'N/A'}`);
        console.log(`分类：${problemInfo.category || 'N/A'}`);
        console.log(`标签：${problemInfo.tags.join(', ') || 'N/A'}`);
        console.log(`链接：https://leetcode.com${problemInfo.link || ''}`);
        console.log(`👍 ${problemInfo.likes || 0} | 👎 ${problemInfo.dislikes || 0}`);
        console.log('-'.repeat(60));
        console.log('📝 题目描述（前 500 字符）:');
        const content = problemInfo.content || '';
        const cleanContent = stripHtml(content);
        console.log(cleanContent.length > 500 ? cleanContent.substring(0, 500) + '...' : cleanContent);
        console.log('='.repeat(60));
    }
}

/**
 * 解析命令行参数
 */
function parseArgs() {
    const args = {
        json: false,
        save: null
    };

    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i] === '--json') {
            args.json = true;
        } else if (process.argv[i] === '--save' && i + 1 < process.argv.length) {
            args.save = process.argv[++i];
        }
    }

    return args;
}

/**
 * 主函数
 */
async function main() {
    const args = parseArgs();
    
    console.log('正在获取 LeetCode 每日一题...');
    const problemInfo = await fetchDailyProblem();
    
    if (problemInfo) {
        formatOutput(problemInfo, args.json);
        
        if (args.save) {
            fs.writeFileSync(args.save, JSON.stringify(problemInfo, null, 2), 'utf-8');
            console.log(`\n✅ 已保存到：${args.save}`);
        }
    } else {
        console.log('❌ 获取失败');
        process.exit(1);
    }
}

// 运行主函数
main().catch(console.error);
