#!/usr/bin/env python3
"""
LeetCode Daily Challenge Fetcher

获取 LeetCode 每日一题信息，包括：
- 题号
- 标题
- 难度
- 标签
- 题目描述

使用方法:
    python fetch-daily-problem.py
    python fetch-daily-problem.py --json  # 输出 JSON 格式
"""

import requests
import json
import argparse
from datetime import datetime

# LeetCode GraphQL endpoint
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

# 获取每日题目的 GraphQL 查询
DAILY_CHALLENGE_QUERY = """
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
"""

# 备用查询：通过日期获取题目
def get_daily_challenge_query(date=None):
    """获取指定日期的每日挑战（默认为今天）"""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    return f"""
    query dailyChallenge {{
        activeDailyCodingChallengeQuestion {{
            date
            question {{
                title
                titleSlug
                content
                questionFrontendId
                difficulty
                topicTags {{
                    name
                    slug
                }}
            }}
        }}
    }}
    """

def fetch_daily_problem():
    """获取每日题目信息"""
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://leetcode.com/",
    }
    
    payload = {
        "query": DAILY_CHALLENGE_QUERY,
        "variables": {}
    }
    
    try:
        response = requests.post(
            LEETCODE_GRAPHQL_URL,
            json=payload,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        
        if "errors" in data:
            print(f"API 错误：{data['errors']}")
            return None
        
        daily_challenge = data.get("data", {}).get("activeDailyCodingChallengeQuestion")
        
        if not daily_challenge:
            print("未找到每日挑战题目")
            return None
        
        question = daily_challenge.get("question", {})
        
        # 提取题目信息
        problem_info = {
            "date": daily_challenge.get("date"),
            "link": daily_challenge.get("link"),
            "question_id": question.get("questionFrontendId"),
            "title": question.get("title"),
            "title_slug": question.get("titleSlug"),
            "difficulty": question.get("difficulty"),
            "likes": question.get("likes"),
            "dislikes": question.get("dislikes"),
            "category": question.get("categoryTitle"),
            "tags": [tag.get("name") for tag in question.get("topicTags", [])],
            "content": question.get("content"),
            "hints": question.get("hints", []),
            "example_testcases": question.get("exampleTestcases"),
            "stats": question.get("stats")
        }
        
        return problem_info
        
    except requests.exceptions.RequestException as e:
        print(f"请求失败：{e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON 解析失败：{e}")
        return None

def format_output(problem_info, as_json=False):
    """格式化输出题目信息"""
    if as_json:
        # 移除 content 字段（太长），其他字段输出 JSON
        output_info = problem_info.copy()
        output_info["content"] = output_info["content"][:200] + "..." if output_info.get("content") else None
        print(json.dumps(output_info, ensure_ascii=False, indent=2))
    else:
        print("=" * 60)
        print("📅 LeetCode 每日一题")
        print("=" * 60)
        print(f"日期：{problem_info.get('date', 'N/A')}")
        print(f"题号：{problem_info.get('question_id', 'N/A')}")
        print(f"标题：{problem_info.get('title', 'N/A')}")
        print(f"难度：{problem_info.get('difficulty', 'N/A')}")
        print(f"分类：{problem_info.get('category', 'N/A')}")
        print(f"标签：{', '.join(problem_info.get('tags', []))}")
        print(f"链接：https://leetcode.com{problem_info.get('link', '')}")
        print(f"👍 {problem_info.get('likes', 0)} | 👎 {problem_info.get('dislikes', 0)}")
        print("-" * 60)
        print("📝 题目描述（前 500 字符）:")
        content = problem_info.get('content', '')
        if content:
            # 简单的 HTML 标签清理
            import re
            clean_content = re.sub(r'<[^>]+>', '', content)
            print(clean_content[:500] + "..." if len(clean_content) > 500 else clean_content)
        print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="获取 LeetCode 每日一题")
    parser.add_argument("--json", action="store_true", help="输出 JSON 格式")
    parser.add_argument("--save", type=str, help="保存到文件")
    args = parser.parse_args()
    
    print("正在获取 LeetCode 每日一题...")
    problem_info = fetch_daily_problem()
    
    if problem_info:
        format_output(problem_info, as_json=args.json)
        
        if args.save:
            with open(args.save, 'w', encoding='utf-8') as f:
                json.dump(problem_info, f, ensure_ascii=False, indent=2)
            print(f"\n✅ 已保存到：{args.save}")
    else:
        print("❌ 获取失败")
        exit(1)

if __name__ == "__main__":
    main()
