import React, { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import './MapView.css';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '0f0618af64041f39a807569d78b37c7d';

export default function MapView({ location, points = [], showRoute = true, zoom = 11 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const mapContainer = mapRef.current;

    const loadMap = async () => {
      try {
        const AMap = await AMapLoader.load({
          key: AMAP_KEY,
          version: '2.0',
          plugins: [
            'AMap.ToolBar',
            'AMap.Scale',
            'AMap.HawkEye',
            'AMap.MapType',
            'AMap.Marker',
            'AMap.Polyline',
            'AMap.InfoWindow'
          ]
        });

        if (!isMounted || !mapContainer) {
          return;
        }

        // 创建地图实例
        const map = new AMap.Map(mapContainer, {
          zoom: zoom,
          center: location ? [location.lng, location.lat] : [116.397428, 39.90923],
          resizeEnable: true
        });

        mapInstanceRef.current = map;

        // 添加控件
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.MapType({
          defaultType: 0
        }));

        // 清除旧标记
        map.clearMap();

        // 添加新标记和路线
        if (points.length > 0) {
          // 创建标记点
          const markers = points.map((point, index) => {
            // 创建自定义标记样式
            const marker = new AMap.Marker({
              position: [point.lng, point.lat],
              title: point.title,
              label: {
                content: `${point.day}-${index + 1}`,
                direction: 'top'
              },
              icon: new AMap.Icon({
                size: new AMap.Size(32, 32),
                image: point.type === 'hotel' 
                  ? 'https://webapi.amap.com/theme/v1.3/markers/b/hotel.png'
                  : 'https://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png',
                imageSize: new AMap.Size(32, 32)
              })
            });

            // 创建信息窗体
            if (point.title || point.info) {
              // 构建地点图片查询
              const imageQuery = encodeURIComponent(`${point.title} ${point.type === 'hotel' ? 'hotel' : 'tourist attraction'}`);
              const imageUrl = point.image || `https://source.unsplash.com/300x200/?${imageQuery}`;
              
              const info = new AMap.InfoWindow({
                content: `<div class="map-info">
                  <div class="map-info-image">
                    <img src="${imageUrl}" alt="${point.title}" style="width:100%;height:120px;object-fit:cover;border-radius:4px;" />
                  </div>
                  <h4>${point.title || ''}</h4>
                  <p class="map-info-time">${point.time || ''}</p>
                  <p class="map-info-desc">${point.description || point.info || ''}</p>
                </div>`,
                offset: new AMap.Pixel(0, -30)
              });

              // 点击标记时显示信息窗体
              marker.on('click', () => {
                info.open(map, marker.getPosition());
              });
            }

            return marker;
          });

          // 添加所有标记到地图
          map.add(markers);

          // 如果需要显示路线且有多个点
          if (showRoute && points.length > 1) {
            const path = points.map(p => [p.lng, p.lat]);
            const polyline = new AMap.Polyline({
              path: path,
              strokeColor: "#3366FF",
              strokeWeight: 4,
              strokeStyle: "dashed",
              strokeDasharray: [10, 5],
              lineJoin: 'round'
            });
            map.add(polyline);
          }

          // 自动调整视野以包含所有点
          map.setFitView();
        }
      } catch (err) {
        console.error('地图加载失败：', err);
        if (isMounted) {
          setError('地图加载失败，请刷新页面重试');
        }
      }
    };

    loadMap();

    // 清理函数
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [location, points, showRoute, zoom]);

  if (error) {
    return <div className="map-error">{error}</div>;
  }

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}