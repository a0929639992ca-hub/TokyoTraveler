import { DaySchedule, FlightInfo } from './types';
import { Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';
import React from 'react';

export const INITIAL_SCHEDULE: DaySchedule[] = [
  {
    id: 'day1',
    date: '01/27',
    dayOfWeek: '週二',
    weather: { temp: 8, condition: 'CLOUDY', feelsLike: 5 },
    items: [
      {
        id: '1',
        type: 'FLIGHT',
        name: '抵達成田機場 (MM620)',
        startTime: '06:30',
        endTime: '07:30',
        notes: 'Peach MM620 抵達第一航廈。領取 WiFi/SIM 卡。',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 45,
          details: '[KS 京成Skyliner] 成田空港(T1) -> 京成上野 | 正面口出站' 
        }
      },
      {
        id: '2',
        type: 'HOTEL',
        name: 'ホテルサンルード“ステラ上野',
        startTime: '09:00',
        notes: '先寄放行李。入住時間為 15:00 後。位於JR上野入谷口旁。',
        locationLink: 'https://maps.google.com/?q=Hotel+Sunroute+Stella+Ueno',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 20,
          details: '[G 銀座線] 上野(G16) -> 銀座(G09) | 上野由 9號出口(電梯) 進站 -> 銀座 A13出口' 
        }
      },
      {
        id: '3',
        type: 'FOOD',
        name: '東京焼肉いのうえ 銀座店',
        startTime: '11:00',
        notes: '★ 已預約 11:00。A5 黑毛和牛燒肉。',
        locationLink: 'https://maps.google.com/?q=Tokyo+Yakiniku+Inoue+Ginza',
        transportToNext: { 
          type: 'WALK', 
          durationMinutes: 10,
          details: '步行至 GINZA SIX (約5分)' 
        }
      },
      {
        id: '4',
        type: 'SHOPPING',
        name: '銀座商圈',
        startTime: '13:00',
        notes: 'GINZA SIX、Uniqlo、Dover Street Market。',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 20,
          details: '[M 丸之內線] 銀座(M16) -> 新宿(M08) | 銀座 C4出口進站 -> 新宿 B12b出口(電梯)' 
        }
      },
      {
        id: '5',
        type: 'SHOPPING',
        name: '新宿商圈',
        startTime: '16:00',
        notes: 'Lumine、伊勢丹、Flags。逛冬季折扣季。',
        transportToNext: { 
          type: 'WALK', 
          durationMinutes: 10,
          details: '步行至新宿西口 (約8分)' 
        }
      },
      {
        id: '6',
        type: 'FOOD',
        name: '牛たん 荒 新宿西口店',
        startTime: '19:00',
        notes: '★ 已預約 19:00。牛舌專賣店。',
        locationLink: 'https://maps.google.com/?q=Gyutan+Ara+Shinjuku',
        transportToNext: {
          type: 'TRAIN',
          durationMinutes: 35,
          details: '[M 丸之內線] 新宿(M08) -> 赤坂見附(轉乘) -> [G 銀座線] -> 上野(G16) | 出口1(電梯) 回飯店'
        }
      }
    ]
  },
  {
    id: 'day2',
    date: '01/28',
    dayOfWeek: '週三',
    weather: { temp: 10, condition: 'SUNNY', feelsLike: 8 },
    items: [
      {
        id: '7',
        type: 'SIGHTSEEING',
        name: '上野恩賜公園 / アメ横',
        startTime: '10:00',
        notes: '飯店附近晨間散步。阿美橫丁商店街。',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 15,
          details: '[G 銀座線] 上野(G16) -> 新橋(G08) | 上野 9號出口(電梯) -> 新橋 3號出口' 
        }
      },
      {
        id: '8',
        type: 'FOOD',
        name: '資生堂パーラー 銀座本店',
        startTime: '11:30',
        notes: '★ 已預約 11:30。經典蛋包飯 (近新橋/銀座)。',
        locationLink: 'https://maps.google.com/?q=Shiseido+Parlour+Ginza',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 20,
          details: '[G 銀座線] 新橋(G08) -> 表參道(G02) | 新橋 1號出口 -> 表參道 A2出口' 
        }
      },
      {
        id: '9',
        type: 'SHOPPING',
        name: '渋谷 / 表参道',
        startTime: '14:00',
        notes: 'Parco、宮下公園 (Miyashita Park)、原宿貓街。',
        transportToNext: { 
          type: 'WALK', 
          durationMinutes: 15,
          details: '沿貓街步行至澀谷' 
        }
      },
      {
        id: '10',
        type: 'SIGHTSEEING',
        name: 'SHIBUYA SKY',
        startTime: '16:30',
        notes: '東京日落美景 (建議事前購票)。',
        ticketPrice: 2500,
        transportToNext: {
            type: 'WALK',
            durationMinutes: 5,
            details: '步行至 Scramble Square 樓下'
        }
      },
      {
        id: '11',
        type: 'FOOD',
        name: '澀谷晚餐',
        startTime: '19:00',
        notes: '澀谷周邊文字燒或居酒屋。',
        transportToNext: {
            type: 'TRAIN',
            durationMinutes: 30,
            details: '[G 銀座線] 澀谷(G01) -> 上野(G16) | 直達免轉乘 -> 出口1(電梯)'
        }
      }
    ]
  },
  {
    id: 'day3',
    date: '01/29',
    dayOfWeek: '週四',
    weather: { temp: 7, condition: 'CLOUDY', feelsLike: 4 },
    items: [
      {
        id: '12',
        type: 'SIGHTSEEING',
        name: '浅草寺 / 雷門',
        startTime: '10:00',
        ticketPrice: 0,
        notes: '參拜觀音、逛仲見世通商店街。',
        locationLink: 'https://maps.google.com/?q=Senso-ji',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 20,
          details: '[G 銀座線] 淺草(G19) -> [Z 半藏門線] 押上(Z14) | 需站外轉乘或步行' 
        }
      },
      {
        id: '13',
        type: 'SHOPPING',
        name: '東京スカイツリータウン',
        startTime: '13:00',
        notes: '東京晴空塔城 (Solamachi)、寶可夢中心。',
        locationLink: 'https://maps.google.com/?q=Tokyo+Skytree',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 35,
          details: '[Z 半藏門線] 押上(Z14) -> 神保町(Z07)轉 [I 三田線] -> 水道橋(I11) | A2出口' 
        }
      },
      {
        id: '14',
        type: 'FOOD',
        name: '晚餐 / 輕食',
        startTime: '17:00',
        notes: '演唱會前於東京巨蛋城附近用餐。',
        transportToNext: { 
          type: 'WALK', 
          durationMinutes: 5,
          details: '步行入場 (22-25門)' 
        }
      },
      {
        id: '15',
        type: 'SIGHTSEEING',
        name: 'LADY GAGA 演唱會',
        startTime: '19:00',
        endTime: '22:00',
        notes: '地點：東京ドーム (Tokyo Dome)。17:00 開場。',
        locationLink: 'https://maps.google.com/?q=Tokyo+Dome',
        transportToNext: {
            type: 'TRAIN',
            durationMinutes: 25,
            details: '[E 大江戶線] 春日(E07) -> 上野御徒町(E09) | 步行回飯店'
        }
      }
    ]
  },
  {
    id: 'day4',
    date: '01/30',
    dayOfWeek: '週五',
    weather: { temp: 8, condition: 'SUNNY', feelsLike: 6 },
    items: [
      {
        id: '16',
        type: 'HOTEL',
        name: '退房 / 前往機場',
        startTime: '07:00',
        notes: '前往京成上野站搭乘 Skyliner。',
        transportToNext: { 
          type: 'TRAIN', 
          durationMinutes: 45,
          details: '[KS 京成Skyliner] 京成上野 -> 成田空港(T1) | 全車指定席' 
        }
      },
      {
        id: '17',
        type: 'FLIGHT',
        name: '搭機返台 (MM623)',
        startTime: '11:05',
        notes: '成田第一航廈出發。預計 14:30 抵達桃園。',
        locationLink: 'https://maps.google.com/?q=Narita+Airport'
      }
    ]
  }
];

export const FLIGHT_INFOS: FlightInfo[] = [
  {
    type: 'OUTBOUND',
    airportCode: '台北 (T1) -> 成田 (T1)',
    flightNumber: 'Peach MM620',
    departureTime: '02:25',
    arrivalTime: '06:30',
    duration: '3小時 05分'
  },
  {
    type: 'INBOUND',
    airportCode: '成田 (T1) -> 台北 (T1)',
    flightNumber: 'Peach MM623',
    departureTime: '11:05',
    arrivalTime: '14:30',
    duration: '4小時 25分'
  }
];

export const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'SUNNY': return <Sun className="w-8 h-8 text-orange-400" />;
    case 'CLOUDY': return <Cloud className="w-8 h-8 text-gray-400" />;
    case 'RAIN': return <CloudRain className="w-8 h-8 text-blue-400" />;
    case 'SNOW': return <Snowflake className="w-8 h-8 text-cyan-300" />;
    default: return <Sun className="w-8 h-8 text-orange-400" />;
  }
};
