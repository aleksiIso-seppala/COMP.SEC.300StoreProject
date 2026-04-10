import item1 from '../assets/Ultrakill.png'
import item2 from '../assets/cairn.png'
import item3 from '../assets/eldenring.png'

export const products = [
  {
    id: 1,
    slug: 'ultrakill',
    title: 'ULTRAKILL',
    description:
      'Rip apart your foes with varied destructive weaponry and shower in their blood to regain your health.',
    longDescription:
      "ULTRAKILL is a fast-paced ultra-violent retro FPS that combines the skill-based style scoring of character action games with the unadulterated carnage inspired by the best shooters of the '90s. Rip apart your foes with varied destructive weaponry and shower in their blood to regain your health.",
    price: 14.99,
    image: item1,
    reviews: [
      {
        id: 1,
        name: 'Alex',
        userId: 'seed-user-1',
        userSlug: 'alex',
        title: 'Perfection',
        rating: 5,
        comment:
          'ULTRAKILL is amazing, the combat is so satisfying and the level design is top-notch.'
      }
    ]
  },
  {
    id: 2,
    slug: 'cairn',
    title: 'Cairn',
    description: 'A survival-climber from the creators of Furi and Haven.',
    longDescription:
      'Reach a summit never climbed before in this survival-climber from the creators of Furi and Haven. Climb anywhere and plan your route carefully, managing pitons and resources to survive unforgiving Mount Kami. Discover what Aava is willing to sacrifice to achieve the ascent of a lifetime.',
    price: 19.99,
    image: item2,
    reviews: []
  },
  {
    id: 3,
    slug: 'elden-ring',
    title: 'Elden Ring',
    description:
      'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    longDescription:
      'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    price: 59.99,
    image: item3,
    reviews: []
  }
]