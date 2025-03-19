import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

interface UpdateItem {
  emoji: string;
  text: string;
}

interface Announcement {
  id: number;
  title: string;
  content: UpdateItem[];
  date: string;
}

const SideAnnouncement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const announcementRef = useRef<HTMLDivElement>(null);
  const [announcements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'V1.2.0 版本更新',
      content: [
        { emoji: '✨', text: '新增聊天引用功能' },
        { emoji: '✨', text: '新增聊天 @ 功能' },
        { emoji: '🔧', text: '修复输入法下回车英文的异常' },
        { emoji: '🐛', text: '修复了一些已知问题' },
        { emoji: '💄', text: '更新了用户称号功能' },
      ],
      date: '2025-03-12',
    },
    {
      id: 2,
      title: 'V1.2.1 版本更新',
      content: [
        { emoji: '✨', text: '新增@机器人功能' },
        { emoji: '✨', text: '优化用户聊天名称以及说话换行' },
        { emoji: '✨', text: '新增用户自定义网站图标以及 icon' },
        { emoji: '✨', text: '新增游戏（跳一跳，模拟赛车）' },
        { emoji: '✨', text: '新增文件上传功能' },
      ],
      date: '2025-03-13',
    },{
      id: 3,
      title: 'V1.2.3 版本更新',
      content: [
        { emoji: '✨', text: '优化@、表情包自动获取输入框焦点' },
        { emoji: '✨', text: 'AI 助手优化海龟汤功能' },
        { emoji: '✨', text: '新增获取用户 IP 地址功能' },
        { emoji: '✨', text: '优化下班倒计时按钮可以选择隐藏显示' },
      ],
      date: '2025-03-14',
    },{
      id: 4,
      title: 'V1.2.4 版本更新',
      content: [
        { emoji: '✨', text: '新增假期倒计时' },
        { emoji: '✨', text: '聊天室支持 shift + enter 换行' },
      ],
      date: '2025-03-18',
    }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isCollapsed &&
        announcementRef.current &&
        !announcementRef.current.contains(event.target as Node)
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      ref={announcementRef}
      className={classNames(styles.sideAnnouncement, {
        [styles.collapsed]: isCollapsed,
      })}
    >
      <div className={styles.toggleButton} onClick={toggleCollapse}>
        {isCollapsed ? '➡️' : '⬅️'}
      </div>
      <Card
        title="更新公告"
        className={styles.card}
        bordered={false}
      >
        {announcements.map((announcement) => (
          <div key={announcement.id} className={styles.announcementItem}>
            <div className={styles.header}>
              <h3>{announcement.title}</h3>
              <span className={styles.date}>{announcement.date}</span>
            </div>
            <ul className={styles.updateList}>
              {announcement.content.map((item, index) => (
                <li key={index}>
                  <span className={styles.emoji}>{item.emoji}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default SideAnnouncement;
