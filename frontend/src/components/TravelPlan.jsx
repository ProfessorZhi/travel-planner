import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import PlaceImage from './PlaceImage';
import './TravelPlan.css';

export default function TravelPlan({ plan }) {
  const [mapPoints, setMapPoints] = useState([]);
  const [centerLocation, setCenterLocation] = useState(null);

  useEffect(() => {
    if (plan && plan.days) {
      const points = [];
      plan.days.forEach((day) => {
        // 处理活动地点
        if (day.activities) {
          day.activities.forEach(activity => {
            if (activity.location) {
              points.push({
                lng: activity.location.lng,
                lat: activity.location.lat,
                title: activity.location.name || activity.title,
                info: `第${day.day}天: ${activity.title}`,
                day: day.day,
                time: activity.time,
                description: activity.description,
                image: activity.image
              });
            }
          });
        }
        // 处理住宿地点
        if (day.accommodation && day.accommodation.location) {
          points.push({
            lng: day.accommodation.location.lng,
            lat: day.accommodation.location.lat,
            title: day.accommodation.name,
            info: `第${day.day}天住宿: ${day.accommodation.name}`,
            day: day.day,
            type: 'hotel',
            description: day.accommodation.description,
            image: day.accommodation.image
          });
        }
      });
      if (points.length > 0) {
        setMapPoints(points);
        setCenterLocation(points[0]);
      }
    }
  }, [plan]);

  if (!plan) return null;

  const [editingTitle, setEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(plan.title);

  const handleTitleEdit = () => {
    if (editingTitle) {
      plan.title = customTitle;  // 更新计划标题
    }
    setEditingTitle(!editingTitle);
  };

  return (
    <div className="travel-plan-grid">
      <div className="map-section">
        <MapView 
          location={centerLocation} 
          points={mapPoints}
          showRoute={true}  // 显示路线
          zoom={12}  // 适当的缩放级别
        />
      </div>
      <div className="plan-section">
        <div className="plan-title-container">
          {editingTitle ? (
            <input
              type="text"
              className="title-input"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleEdit()}
              autoFocus
            />
          ) : (
            <h2 className="plan-title" onClick={() => setEditingTitle(true)}>
              {customTitle}
              <span className="edit-icon">✎</span>
            </h2>
          )}
          <button className="edit-title-btn" onClick={handleTitleEdit}>
            {editingTitle ? '保存' : '编辑'}
          </button>
        </div>
        <div className="plan-days">
          {plan.days?.map((day, index) => (
            <div key={index} className="day-card">
              <div className="day-img-wrap">
                {/* 自动配图，优先用当天第一个活动或住宿地名 */}
                <PlaceImage place={day.activities?.[0] || day.accommodation || plan.title} style={{height:160}} />
              </div>
              <div className="day-info">
                <h3>第 {day.day} 天</h3>
                <div className="date">
                  {day.date && day.date !== 'YYYY-MM-DD' 
                    ? new Date(day.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })
                    : '日期待定'
                  }
                </div>
                <div className="activities">
                  {day.activities?.map((activity, i) => (
                    <div key={i} className="activity-item">{activity}</div>
                  ))}
                </div>
                {day.accommodation && (
                  <div className="accommodation"><strong>住宿：</strong> {day.accommodation}</div>
                )}
                {day.transportation && (
                  <div className="transportation"><strong>交通：</strong> {day.transportation}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {plan.budget && (
          <div className="budget-section">
            <h3>预算详情</h3>
            <div className="budget-total">总预算：{plan.budget.total} {plan.budget.currency || 'CNY'}</div>
            {plan.budget.breakdown && (
              <div className="budget-breakdown">
                {Object.entries(plan.budget.breakdown).map(([category, amount]) => (
                  <div key={category} className="budget-item">
                    <span className="category">{category}：</span>
                    <span className="amount">{amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {plan.tips && plan.tips.length > 0 && (
          <div className="tips-section">
            <h3>旅行建议</h3>
            <ul>
              {plan.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}