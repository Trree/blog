type Project = {
  title: string
  description: string
  imgSrc: string
  href: string
}

type ProjectsData = {
  [locale: string]: Project[]
}

const projectsData: ProjectsData = {
  en: [
    {
      title: 'A Search Engine',
      description: `What if you could look up any information in the world? Webpages, images, videos
        and more. Google has many features to help you find exactly what you're looking
        for.`,
      imgSrc: '/static/images/google.png',
      href: 'https://www.google.com',
    },
    {
      title: 'The Time Machine',
      description: `Imagine being able to travel back in time or to the future. Simple turn the knob
        to the desired date and press "Go". No more worrying about lost keys or
        forgotten headphones with this simple yet affordable solution.`,
      imgSrc: '/static/images/time-machine.jpg',
      href: '/blog/the-time-machine',
    },
  ],

  zh: [
    {
      title: '搜索引擎',
      description: `如果你可以查找世界上的任何信息会怎样？网页、图片、视频等等。
        Google 有许多功能可以帮助你准确找到你要找的内容。`,
      imgSrc: '/static/images/google.png',
      href: 'https://www.google.com',
    },
    {
      title: '时光机',
      description: `想象一下能够穿越到过去或未来。只需将旋钮转到所需的日期，然后按"Go"。
        使用这个简单而实惠的解决方案，不再担心丢失钥匙或忘记耳机。`,
      imgSrc: '/static/images/time-machine.jpg',
      href: '/blog/the-time-machine',
    },
  ],
}

export default projectsData
