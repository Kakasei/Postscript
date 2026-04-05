---
title: "qbittorrent enhanced edition（便携版）屏蔽吸血客户端"
publishedAt: "2026-04-05T19:30:00+08:00"
updatedAt: "2026-04-05T22:10:00+08:00"
tags:
  - BT
  - "qBittorrent"
  - 排障
summary: "记录在 qBittorrent Enhanced Edition 中按 Peer ID 屏蔽吸血客户端时踩过的坑与最终可行方案。"
pin: 1
layout: doc
---

前段时间 gnosia 改编的动画更新完了，评价还不错，自己也跟着主播看了两集，正好lolihouse的全集资源也出了，于是和往常一样打开 qbittorrent ee开始下资源

几个月没怎么下动画了，bt的生态还是那么糟糕，一打开qbit上行带宽就跑满了，扫了两眼，基本上全是 qbittorrent4.6.7，一直在吃上传，但文件关联始终为0%，怀疑全是吸血客户端：

![](https://cdn.jsdelivr.net/gh/kakasei/Postscript@main/assets/img/2026/qbittorrent%20enhanced%20edition%EF%BC%88%E4%BE%BF%E6%90%BA%E7%89%88%EF%BC%89%E5%B1%8F%E8%94%BD%E5%90%B8%E8%A1%80%E5%AE%A2%E6%88%B7%E7%AB%AF/image.png)
但一个一个手动屏蔽太多了，而且会一直冒出新的，于是在网上搜索了一下按照客户端版本屏蔽的方法

由于我同时在使用 qbittorrent 和 qbittorrent ee，而 qbittorrent ee以便携模式运行。便携模式下，在 `/qbittorrent enhanced/profile/qBittorrent/data` 文件夹中添加 `peer_blacklist.txt` 文件，写入 `-qB4670- .*` ，表示屏蔽所有peerID为 `-qB4670-` 的所有客户端。虽然看网上更推荐 PeerBanHelper，但我嫌太麻烦了，暂且先用黑名单一刀切所有 qbittorrent 4.6.7客户端：

![](https://cdn.jsdelivr.net/gh/kakasei/Postscript@main/assets/img/2026/qbittorrent%20enhanced%20edition%EF%BC%88%E4%BE%BF%E6%90%BA%E7%89%88%EF%BC%89%E5%B1%8F%E8%94%BD%E5%90%B8%E8%A1%80%E5%AE%A2%E6%88%B7%E7%AB%AF/image2.png)

![](https://cdn.jsdelivr.net/gh/kakasei/Postscript@main/assets/img/2026/qbittorrent%20enhanced%20edition%EF%BC%88%E4%BE%BF%E6%90%BA%E7%89%88%EF%BC%89%E5%B1%8F%E8%94%BD%E5%90%B8%E8%A1%80%E5%AE%A2%E6%88%B7%E7%AB%AF/image4.png)

重启qbit ee后黑名单却没有生效，查看执行日志，显示 `'peer_blacklist.txt' has no valid rules. The corresponding filter is disabled.` ，也就是读取不到黑名单的规则。反复确认自己没有任何输入错误，重启数次也没有解决问题，最后找到了这个issue： https://github.com/c0re100/qBittorrent-Enhanced-Edition/issues/547

看来是文件路径中包含了非ASCII字符导致黑名单文件读取不出来，重新调整了一下qbit ee的路径后，再次重启，成功读取到黑名单，且黑名单生效，所有qibt4.6.7客户端都被ban了：

![](https://cdn.jsdelivr.net/gh/kakasei/Postscript@main/assets/img/2026/qbittorrent%20enhanced%20edition%EF%BC%88%E4%BE%BF%E6%90%BA%E7%89%88%EF%BC%89%E5%B1%8F%E8%94%BD%E5%90%B8%E8%A1%80%E5%AE%A2%E6%88%B7%E7%AB%AF/image3.png)
