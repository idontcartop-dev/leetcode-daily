# Two Sum 两数之和

**题号**: 1  
**难度**: Easy  
**日期**: 2026-03-15  
**标签**: #数组 #哈希表

---

## 题目描述

给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。

---

## 思路

使用哈希表存储已遍历的数字及其索引，对于每个数字，检查 target - num 是否已在哈希表中。

---

## 代码实现

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []
```

---

## 复杂度分析

- 时间复杂度: O(n)
- 空间复杂度: O(n)

---

## 笔记

经典哈希表应用题，注意返回的是索引而非值。
