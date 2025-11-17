'use client';

import { useState } from 'react';

type TabType = 'users' | 'teams' | 'resources' | 'locations';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>관리자 대시보드</h1>
        <p className="page-description">
          시스템 설정 및 사용자 관리
        </p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          사용자 관리
        </button>
        <button
          className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          팀 관리
        </button>
        <button
          className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          회의실 & 자원
        </button>
        <button
          className={`tab ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          근무 위치
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'teams' && <TeamsManagement />}
        {activeTab === 'resources' && <ResourcesManagement />}
        {activeTab === 'locations' && <LocationsManagement />}
      </div>
    </div>
  );
}

function UsersManagement() {
  return (
    <div className="management-section">
      <div className="section-header">
        <h2>사용자 관리</h2>
        <button className="btn-primary">+ 사용자 추가</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>팀</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>김철수</td>
              <td>kim@example.com</td>
              <td>
                <span className="badge badge-blue">Staff</span>
              </td>
              <td>개발팀</td>
              <td>
                <span className="badge badge-green">활성</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>이영희</td>
              <td>lee@example.com</td>
              <td>
                <span className="badge badge-purple">Manager</span>
              </td>
              <td>디자인팀</td>
              <td>
                <span className="badge badge-green">활성</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamsManagement() {
  return (
    <div className="management-section">
      <div className="section-header">
        <h2>팀 관리</h2>
        <button className="btn-primary">+ 팀 추가</button>
      </div>

      <div className="cards-grid">
        <div className="team-card">
          <h3>개발팀</h3>
          <p className="team-member-count">12명의 팀원</p>
          <div className="team-actions">
            <button className="btn-secondary">멤버 관리</button>
            <button className="btn-icon">✏️</button>
          </div>
        </div>
        <div className="team-card">
          <h3>디자인팀</h3>
          <p className="team-member-count">8명의 팀원</p>
          <div className="team-actions">
            <button className="btn-secondary">멤버 관리</button>
            <button className="btn-icon">✏️</button>
          </div>
        </div>
        <div className="team-card">
          <h3>마케팅팀</h3>
          <p className="team-member-count">5명의 팀원</p>
          <div className="team-actions">
            <button className="btn-secondary">멤버 관리</button>
            <button className="btn-icon">✏️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourcesManagement() {
  return (
    <div className="management-section">
      <div className="section-header">
        <h2>회의실 & 자원 관리</h2>
        <button className="btn-primary">+ 자원 추가</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>유형</th>
              <th>수용인원</th>
              <th>Zoom</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>대회의실 A</td>
              <td>
                <span className="badge badge-blue">회의실</span>
              </td>
              <td>20명</td>
              <td>✅</td>
              <td>
                <span className="badge badge-green">사용가능</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>소회의실 B</td>
              <td>
                <span className="badge badge-blue">회의실</span>
              </td>
              <td>6명</td>
              <td>✅</td>
              <td>
                <span className="badge badge-green">사용가능</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>Zoom Pro #1</td>
              <td>
                <span className="badge badge-purple">Zoom</span>
              </td>
              <td>100명</td>
              <td>-</td>
              <td>
                <span className="badge badge-green">사용가능</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LocationsManagement() {
  return (
    <div className="management-section">
      <div className="section-header">
        <h2>근무 위치 관리</h2>
        <button className="btn-primary">+ 위치 추가</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>위도</th>
              <th>경도</th>
              <th>반경 (m)</th>
              <th>허용 모드</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>본사</td>
              <td>37.5665</td>
              <td>126.9780</td>
              <td>100m</td>
              <td>
                <span className="badge badge-blue">현장</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>강남 지점</td>
              <td>37.4979</td>
              <td>127.0276</td>
              <td>100m</td>
              <td>
                <span className="badge badge-blue">현장</span>
              </td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

