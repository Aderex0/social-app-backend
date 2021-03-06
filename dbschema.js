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
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: 'i2i3o4j23kl4j2l3k4j2k342',
      body: 'This is the body',
      createdAt: '2020-04-04T09:58:33.518Z'
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: true,
      screamId: 'j23h4k2j34h23kj4',
      type: 'like | comment',
      createdAt: '2020-04-04T09:58:33.518Z'
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
