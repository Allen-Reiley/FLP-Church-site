import { Sermon, Elder, NewsItem, Involvement } from './types';

export const SERMONS: Sermon[] = [
  {
    id: 'sermon-1',
    title: 'The Power of the Root',
    speaker: 'Pastor David',
    series: 'The Foundation',
    date: 'Oct 15, 2023',
    duration: '45:20',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWNwtjbq8CEnz8QSKrWK7ks3tULzhIKqrXqloDdDYp-_Lj8Fnn25Zz38rmr0KDO-gKuE-Iulu1E2EQSRJhtQycCYuwSMz0LTTKoHEbz-AMPBOQqpEVsV1plpgiWCKe36O527gC3N6xn9-HSv0P7gU6P90ZjTC7BQ02e-mMyxc_LEGuAGKFxA86DyeqOly76tBUB4QGHqZ2X6j8WELXfQ0HvuLNibS3ot9WQ2dqrXwW8T0kEzmTMbO78sJvBmPPVrgJren10ib06G8',
    hasAudio: true,
  },
  {
    id: 'sermon-2',
    title: 'Flowing in the Spirit',
    speaker: 'Elder James',
    series: 'Spirit & Truth',
    date: 'Oct 08, 2023',
    duration: '52:10',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChv9mnB6FLvIoBVlVR3H7iVRMCVT3nm3YbSo_usUfrHGk0ocCBNsAdqcH_z3AjJpTo-nSLyiT_8egDp0UHmhvznNDwnwZSuS52PsON1HFM_NziW7bO_bNz7sdozzjIUpCAVAECm8f9gBaGBi9AApjGQscBEuZdTFOAZVA0hmV-58TXPxbbllotb1G7arQo_sJn0Q7nLhtPZtKF_qk81WdxcWUhrzucTb65KxBZ2xwfHNTEGqcnIeoRLO7VAWtatRAWoiP_9dI_cHw',
    hasAudio: true,
  },
  {
    id: 'sermon-3',
    title: 'Building the Kingdom',
    speaker: 'Pastor David',
    series: 'Sunday Messages',
    date: 'Oct 01, 2023',
    duration: '38:45',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    imageUrl: 'graphic_eq', // Custom indicator as shown in the screenshot Wave placeholder
    hasAudio: true,
  },
  {
    id: 'sermon-4',
    title: 'Deep Roots, Flourishing Grove',
    speaker: 'Pastor David',
    series: 'The Foundation',
    date: 'Sep 24, 2023',
    duration: '41:15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWNwtjbq8CEnz8QSKrWK7ks3tULzhIKqrXqloDdDYp-_Lj8Fnn25Zz38rmr0KDO-gKuE-Iulu1E2EQSRJhtQycCYuwSMz0LTTKoHEbz-AMPBOQqpEVsV1plpgiWCKe36O527gC3N6xn9-HSv0P7gU6P90ZjTC7BQ02e-mMyxc_LEGuAGKFxA86DyeqOly76tBUB4QGHqZ2X6j8WELXfQ0HvuLNibS3ot9WQ2dqrXwW8T0kEzmTMbO78sJvBmPPVrgJren10ib06G8',
    hasAudio: true,
  },
  {
    id: 'sermon-5',
    title: 'Walking in Light & Truth',
    speaker: 'Guest Speaker',
    series: 'Kingdom Builders',
    date: 'Sep 17, 2023',
    duration: '46:32',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChv9mnB6FLvIoBVlVR3H7iVRMCVT3nm3YbSo_usUfrHGk0ocCBNsAdqcH_z3AjJpTo-nSLyiT_8egDp0UHmhvznNDwnwZSuS52PsON1HFM_NziW7bO_bNz7sdozzjIUpCAVAECm8f9gBaGBi9AApjGQscBEuZdTFOAZVA0hmV-58TXPxbbllotb1G7arQo_sJn0Q7nLhtPZtKF_qk81WdxcWUhrzucTb65KxBZ2xwfHNTEGqcnIeoRLO7VAWtatRAWoiP_9dI_cHw',
    hasAudio: true,
  },
  {
    id: 'sermon-6',
    title: 'The Blueprint of Stewardship',
    speaker: 'Elder James',
    series: 'Sunday Messages',
    date: 'Sep 10, 2023',
    duration: '35:20',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    imageUrl: 'graphic_eq',
    hasAudio: true,
  }
];

export const ELDERS: Elder[] = [
  {
    name: 'Titus & Ellen',
    role: 'Elders',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLvKFK1Hyz3aQtACITWy8wUIuepv6jymV0BwGcujBf-t3MsrCwC4cxHuH5j5g1JZz9dFV4CpUtQ0nYi866Px6V-M2Z0azYzoYiFUAp4-2bqEzcxFLDcC5jz-nYPtq6ggh_MX1-t9-MQ9LSS9p5I-Sh_ShTO34MyZzQsKBYmKbPclneRk5wExRxZxa6x6aFdgL3mlqYyyh63WyAjikcMUEIQq3SUewH7YkQnNPg4v88vBSua3xSx1-AEiUfM',
    isLead: false,
  },
  {
    name: 'Thuls & Pinks',
    role: 'Lead Elders',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLunUHYupG5E-pGV_S9WK7Bioywc2swYoGard8k7U_82akAdb_3OzRN-53wy-gmx1FB2ot7PTy1CYE4AbBhPc8C96ldde49RzzHuRyFflI7QljTftEXwtr3VlRkas7D9jr7ABkj-g8uIoYZV0tMG29ii-SnBDwP8lTcIW9oGth8JgwfvCRxMZDFTxxiD3_9m6XJ5RtMRXXcYxymQA6Mnbg26v1PfJud4zcmhY_qEu2UqU9nRyx2Jlr6ERTc',
    isLead: true,
  },
  {
    name: 'Carl & Ro',
    role: 'Elders',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLuGkmALdbBNZ-6nkgOZ7RZslIlIoP1rLi_9u6HHkMo-JYKwxnM9Tels9JlqukHVJtKRhjVhG21UfEv10uTEgUSUnUe5arFCBPQDRTjPQWFTUrXrxPDKlztfyw55Q-w8Ybgi9qR-jZJWPIuZBWU_O5iHd9wbtXp_gksUTEcNe-qBIg9sexixyty0NG42_giTytrHAOD_b5BXZhguWrnCoqx3uy5DKSGnr2kCXMRPC-WVBt_G0Z7VqSWa-qo',
    isLead: false,
  }
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Spring Picnic & Baptisms',
    category: 'Event',
    date: 'Oct 20, 2023',
    summary: 'Join us by the lake as we celebrate new life and enjoy an afternoon of fellowship, food, and games together under the sun.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdcDBlyxZpQBmLFMJMCXZcT18SIqgPJo87IuCDAgyErj0DbgiimfROYhawi9-HrznpdmbmrNPZnzd7AsN9xa4sScHrSIXAMkydM_e2TTpesSLGiPIV8TnCpD81ajaoT2lm8LbG3iIE61NYelQyQLrlDDjHsQ6L5sPKTtwaj9sbqkuRUXTBin-rVjuAyQlDnufb3hQdHACR074fZmvKZ1JB01fj84AeD3g8OYY2Ygv9sP7GLc1rSA9fA4j5kgobUHSSDlqTIMv8fpA',
  },
  {
    id: 'news-2',
    title: 'Foundations Course Starting',
    category: 'Course',
    date: 'Nov 02, 2023',
    summary: 'Whether you are new to faith or looking to strengthen your roots, our new 6-week foundations course is the perfect place to start.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKP6-0xJisaMbjXat_k_jGDbm59VPeaWgoNYayIfjtXsOhx20lIq9EldnyMWxkDQVkd1WAzLhEVVXelhRtuL7Ys3hHy4SXQVqkGd1aE5MbaGhrOybJinD86i5yUYaigSi2VUm_kFg__UL3faits4ne7lv2QhFj4jXOY6n14vlxuW54VlHMcggE1EI3ldaJiAIOtbMFMbnMdccOpl_sUJrARPhijPCqkUYrPta6EUFH-kmb2XHnKV0jPymFc60vMTWe-ZJw38OUUyk',
  },
  {
    id: 'news-3',
    title: 'Autumn Retreat 2023',
    category: 'Retreat',
    date: 'Oct 15, 2023',
    summary: 'Join us for a weekend of spiritual renewal and communal warmth in the mountains.',
  },
  {
    id: 'news-4',
    title: 'New Sermon Series',
    category: 'Series',
    date: 'Nov 02, 2023',
    summary: 'Starting this Sunday, we dive into \'Deep Roots\', exploring the foundations of our faith.',
  },
  {
    id: 'news-5',
    title: 'Community Thanksgiving',
    category: 'Community',
    date: 'Nov 18, 2023',
    summary: 'A time to gather, share a meal, and give thanks for the growth we\'ve seen this year.',
  }
];

export const INVOLVEMENTS: Involvement[] = [
  {
    id: 'inv-1',
    title: 'Community Care / Volunteer',
    description: 'Help us tend to the needs of our grove. From meal trains to visitation, your hands can bring comfort.',
    icon: 'volunteer_activism',
  },
  {
    id: 'inv-2',
    title: 'Small Groups / Gathering Hosts',
    description: 'Create welcoming environments for our Sunday meetings and mid-week connection groups.',
    icon: 'groups',
  },
  {
    id: 'inv-3',
    title: 'Kids Ministry / Child Care',
    description: 'Support youth development and children\'s faith journeys through play and storytelling.',
    icon: 'child_care',
  },
  {
    id: 'inv-4',
    title: 'Worship Team / Worship Arts',
    description: 'Use your musical or technical gifts to help cultivate an atmosphere of praise and reflection.',
    icon: 'music_note',
  }
];
