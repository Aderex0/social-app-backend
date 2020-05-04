let db = {
  users: [
    {
      userId: 'dh345jjh3234lkj4234lf',
      email: 'user@gmail.com',
      userHandle: 'user',
      createdAt: '2020-04-04T09:58:33.518Z',
      imageUrl: 'https://image.com/imageurl',
      bio: 'This is a test bio',
      website: 'https://user.com',
      location: 'London, UK'
    }
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'this is the scream',
      createdAt: '2020-04-04T09:58:33.518Z',
      likeCount: 5,
      commentCount: 2
    }
  ]
}

const userDetails = {
  credentials: {
    userId: 'dh345jjh3234lkj4234lf',
    email: 'user@gmail.com',
    userHandle: 'user',
    createdAt: '2020-04-04T09:58:33.518Z',
    imageUrl: 'https://image.com/imageurl',
    bio: 'This is a test bio',
    website: 'https://user.com',
    location: 'London, UK'
  },
  likes: [
    { userHandle: 'user', screamId: '42342khkjj34234kjh234jh545j' },
    { userHandle: 'user', screamId: '234jhu348h34hk3j4878ghjjhi7' }
  ]
}
