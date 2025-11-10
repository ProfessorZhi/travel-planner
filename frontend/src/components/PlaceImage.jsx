import React, { useEffect, useState } from 'react';

const TRAVEL_PHOTOS = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',  // 自然风光
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',  // 山脉
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',  // 城市风光
  'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd',  // 旅行
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',  // 海滩
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be',  // 文化古迹
  'https://images.unsplash.com/photo-1554357395-dbdc356ca5b5',  // 美食
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',  // 街道
];

const getRandomImage = () => {
  const idx = Math.floor(Math.random() * TRAVEL_PHOTOS.length);
  return `${TRAVEL_PHOTOS[idx]}?auto=format&fit=crop&w=400&q=80`;
};

export default function PlaceImage({ place, style }) {
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    if (!place) {
      setImgUrl(getRandomImage());
      return;
    }

    // 提取搜索关键词
    const keywords = place.split(/[,，、]|\s+/)  // 按逗号、顿号、空格分割
      .filter(k => k.length > 1)  // 过滤掉太短的词
      .map(k => k.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, ''));  // 只保留中英文
    
    // 如果没有有效关键词，使用随机图片
    if (keywords.length === 0) {
      setImgUrl(getRandomImage());
      return;
    }

    // 尝试搜索地名相关图片
    const searchTerm = encodeURIComponent(`${keywords[0]} travel landscape scenic`);
    fetch(`https://api.unsplash.com/photos/random?query=${searchTerm}&orientation=landscape`, {
      headers: {
        'Authorization': 'Client-ID 您的Unsplash_Access_Key'  // 请替换为你的 Unsplash API key
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.urls) {
          setImgUrl(data.urls.small);
        } else {
          setImgUrl(getRandomImage());
        }
      })
      .catch(() => {
        setImgUrl(getRandomImage());
      });
  }, [place]);

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 8,
    ...style
  };

  if (!imgUrl) return <div className="place-image-loading" style={style}>图片加载中...</div>;
  return <img src={imgUrl} alt={place} style={imgStyle} />;
}
