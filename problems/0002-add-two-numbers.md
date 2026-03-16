# Add Two Numbers 两数相加

**题号**: 2  
**难度**: Medium  
**日期**: 2026-03-16  
**标签**: #链表 #数学

---

## 题目描述

给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。

---

## 思路

模拟加法过程，逐位相加并处理进位。

---

## 代码实现

```python
class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)
        curr = dummy
        carry = 0
        
        while l1 or l2 or carry:
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            total = val1 + val2 + carry
            
            carry = total // 10
            curr.next = ListNode(total % 10)
            curr = curr.next
            
            if l1: l1 = l1.next
            if l2: l2 = l2.next
        
        return dummy.next
```

---

## 复杂度分析

- 时间复杂度: O(max(m, n))
- 空间复杂度: O(1)

---

## 笔记

注意处理最后可能的进位。
