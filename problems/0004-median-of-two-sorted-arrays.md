# Median of Two Sorted Arrays 寻找两个正序数组的中位数

**题号**: 4  
**难度**: Hard  
**日期**: 2026-03-14  
**标签**: #数组 #二分查找 #分治

---

## 题目描述

给定两个大小分别为 m 和 n 的正序数组 nums1 和 nums2，找出并返回这两个正序数组的中位数。

---

## 思路

使用二分查找，在较短的数组上进行分割，确保左右两部分元素数量相等。

---

## 代码实现

```python
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        
        m, n = len(nums1), len(nums2)
        left, right = 0, m
        
        while left <= right:
            partition1 = (left + right) // 2
            partition2 = (m + n + 1) // 2 - partition1
            
            maxLeft1 = float('-inf') if partition1 == 0 else nums1[partition1 - 1]
            minRight1 = float('inf') if partition1 == m else nums1[partition1]
            maxLeft2 = float('-inf') if partition2 == 0 else nums2[partition2 - 1]
            minRight2 = float('inf') if partition2 == n else nums2[partition2]
            
            if maxLeft1 <= minRight2 and maxLeft2 <= minRight1:
                if (m + n) % 2 == 0:
                    return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2
                else:
                    return max(maxLeft1, maxLeft2)
            elif maxLeft1 > minRight2:
                right = partition1 - 1
            else:
                left = partition1 + 1
        
        raise ValueError("输入数组不是有序的")
```

---

## 复杂度分析

- 时间复杂度: O(log(min(m, n)))
- 空间复杂度: O(1)

---

## 笔记

Hard 难度经典题，关键是找到正确的分割点。
