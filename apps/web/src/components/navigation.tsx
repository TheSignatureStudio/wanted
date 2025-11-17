'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/dashboard', label: '대시보드', icon: '📊' },
    { href: '/calendar', label: '캘린더', icon: '📅' },
    { href: '/remote', label: '재택근무', icon: '🏡' },
    { href: '/leave', label: '휴가', icon: '🌴' },
    { href: '/reservations', label: '예약', icon: '🏢' },
    { href: '/admin', label: '관리', icon: '⚙️' },
  ];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">
            <span className="brand-logo">📍</span>
            <span className="brand-name">Wanted Attendance</span>
          </Link>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-user">
          <div className="user-avatar">👤</div>
          <span className="user-name">데모 사용자</span>
        </div>
      </div>
    </nav>
  );
}

