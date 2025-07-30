<template>
  <div class="w-100 mn-x-auto pd-x-regular w-max-66r">
    <!-- Профиль организации -->
    <div v-if="organizationData" class="mn-b-big">
      <!-- Обложка с статистикой -->
      <div class="w-100 h-20r radius-medium o-hidden pos-relative">
        <img
          :src="organizationData?.profile?.photo"
          :alt="organizationData?.profile?.name"
          class="w-100 h-100 object-fit-cover"
        />
      </div>
      
      <!-- Основная информация -->
      <div class="bg-light radius-medium pd-medium mn-t-regular">
        <div class="flex gap-medium">
          <!-- Аватар -->
          <div class="pos-relative">
            <img
              :src="organizationData?.profile?.photo"
              :alt="organizationData?.profile?.name"
              class="w-8r h-8r radius-medium object-fit-cover"
            />
            <div
              class="pos-absolute pos-b-micro pos-r-micro w-1r h-1r radius-extra"
              :class="{
                'bg-green': organizationState.status === 'active',
                'bg-grey': organizationState.status === 'inactive',
                'bg-yellow': organizationState.status === 'busy'
              }"
            ></div>
          </div>
          
          <!-- Информация -->
          <div class="flex-child-1">
            <div class="flex gap-small mn-b-small">
              <h1 class="h1">{{ organizationData?.profile?.name }}</h1>
              <div
                v-if="organizationData?.official"
                class="flex gap-micro bg-second pd-micro radius-small t-white p-small"
              >
                <CheckCircle class="i-small fill-white" />
                <span>Verified</span>
              </div>
            </div>
            
            <p class="mn-b-medium t-grey">{{ organizationData?.profile?.description }}</p>
            
            <div class="flex gap-small mn-b-medium">
              <div class="flex gap-micro bg-light pd-small radius-small">
                <Calendar class="i-small fill-main" />
                <!-- <span class="p-small">{{ formatDate(organizationData?.createdAt) }}</span> -->
              </div>
              <div class="flex gap-micro bg-light pd-small radius-small">
                <Globe class="i-small fill-main" />
                <span class="p-small">{{ organizationData?.types?.[0] }}</span>
              </div>
            </div>
            
            <div class="flex gap-micro mn-b-medium">
              <span
                v-for="tag in organizationData?.profile?.tags"
                :key="tag"
                class="bg-main-nano pd-micro radius-small p-small"
              >
                {{ tag }}
              </span>
            </div>
            
            <div class="flex gap-small">
              <button class="bg-main pd-small radius-small t-white flex gap-micro">
                <Users class="i-small fill-white" />
                Присоединиться
              </button>
              <ButtonToggleMembership
                v-if="organizationData"
                :user="auth.state.user"
                type="organization"
                role="subscriber"
                :target="organizationData"
                :status="membershipsStore.state.isSubscriber"
                text="Подписаться"
                class="bg-light pd-small radius-small t-dark"
              />
              <button class="bg-light pd-small radius-small">
                <Share2 class="i-small" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- О нас и соцсети -->
    <div v-if="organizationData" class="cols-2  gap-medium mn-b-big">
      <!-- О нас -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h4 mn-b-small">О нас</h3>
        <p class="mn-b-medium">{{ organizationData?.profile?.description }}</p>
        <div class="flex gap-medium">
          <div class="t-center">
            <div class="h3 t-main">{{ organizationState.stats.projects }}</div>
            <div class="p-small t-grey uppercase">проектов</div>
          </div>
          <div class="t-center">
            <div class="h3 t-main">{{ organizationState.stats.posts }}</div>
            <div class="p-small t-grey uppercase">постов</div>
          </div>
        </div>
      </div>
      
      <!-- Соцсети -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h4 mn-b-small">Мы в соцсетях</h3>
        <div class="flex flex-column gap-small">
          <a
            v-if="organizationData?.socials?.telegram"
            :href="organizationData.socials.telegram"
            target="_blank"
            class="flex gap-small pd-small bg-light radius-small"
          >
            <MessageCircle class="i-small fill-main" />
            <span>Telegram</span>
          </a>
          <a
            v-if="organizationData?.socials?.facebook"
            :href="organizationData.socials.facebook"
            target="_blank"
            class="flex gap-small pd-small bg-light radius-small"
          >
            <Users class="i-small fill-main" />
            <span>Facebook</span>
          </a>
          <a
            v-if="organizationData?.socials?.instagram"
            :href="organizationData.socials.instagram"
            target="_blank"
            class="flex gap-small pd-small bg-light radius-small"
          >
            <Play class="i-small fill-main" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Участники -->
    <div class="bg-white pd-medium radius-medium mn-b-big">
      <div class="flex flex-justify-between mn-b-medium">
        <h2 class="h3 t-main flex gap-small">
          <Users class="i-medium fill-main" />
          Участники
        </h2>
        <button
          class="pd-small bg-light radius-small t-dark hover-bg-main hover-t-white transition-linear flex gap-micro"
          @click="goToMembersPage"
        >
          Все участники
          <ArrowRight class="i-small" />
        </button>
      </div>
      
      <div class="flex flex-column gap-small">
        <!-- Владелец -->
        <div class="pos-relative flex gap-small pd-small radius-small bg-main-nano">
          <div class="pos-absolute pos-t-micro pos-l-micro w-1r h-1r radius-extra bg-yellow"></div>
          <img
            :src="organizationState.owner.avatar"
            :alt="organizationState.owner.name"
            class="w-5r h-5r radius-medium object-fit-cover"
          />
          <div class="flex-child-1">
            <div class="t-semi">{{ organizationState.owner.name }}</div>
            <div class="p-small t-main">Владелец</div>
            <div class="p-small t-grey">онлайн</div>
          </div>
          <div class="w-3r h-3r radius-extra bg-main flex flex-center">
            <Crown class="i-small fill-white" />
          </div>
        </div>
        
        <!-- Администраторы -->
        <div
          v-for="admin in organizationState.admins"
          :key="admin.id"
          class="pos-relative flex gap-small pd-small radius-small bg-second-nano"
        >
          <div class="pos-absolute pos-t-micro pos-l-micro w-1r h-1r radius-extra bg-second"></div>
          <img
            :src="admin.avatar"
            :alt="admin.name"
            class="w-5r h-5r radius-medium object-fit-cover"
          />
          <div class="flex-child-1">
            <div class="t-semi">{{ admin.name }}</div>
            <div class="p-small t-second">Администратор</div>
            <div class="p-small t-grey">2 часа назад</div>
          </div>
          <div class="w-3r h-3r radius-extra bg-second flex flex-center">
            <Shield class="i-small fill-white" />
          </div>
        </div>
        
        <!-- Участники -->
        <div
          v-for="member in organizationState.featuredMembers"
          :key="member.id"
          class="pos-relative flex gap-small pd-small radius-small bg-light"
        >
          <div class="pos-absolute pos-t-micro pos-l-micro w-1r h-1r radius-extra bg-green"></div>
          <img
            :src="member.avatar"
            :alt="member.name"
            class="w-5r h-5r radius-medium object-fit-cover"
          />
          <div class="flex-child-1">
            <div class="t-semi">{{ member.name }}</div>
            <div class="p-small t-dark">Участник</div>
            <div class="p-small t-grey">вчера</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Контакты и адреса -->
    <div class="bg-white pd-medium radius-medium mn-b-big">
      <h2 class="h3 t-main flex gap-small mn-b-medium">
        <MapPin class="i-medium fill-main" />
        Контакты и адреса
      </h2>
      
      <div class="cols-2 gap-medium">
        <!-- Контакты -->
        <div>
          <h3 class="h4 mn-b-small">Связь с нами</h3>
          <div class="flex flex-column gap-small">
            <div class="flex gap-small pd-small bg-light radius-small">
              <Phone class="i-small fill-main" />
              <div>
                <div class="p-small t-grey uppercase">Телефон</div>
                <div>{{ organizationData?.contacts?.phone }}</div>
                <div class="p-small t-grey">Пн-Пт 9:00-18:00</div>
              </div>
            </div>
            
            <div class="flex gap-small pd-small bg-light radius-small">
              <Mail class="i-small fill-main" />
              <div>
                <div class="p-small t-grey uppercase">Email</div>
                <div>{{ organizationData?.contacts?.email }}</div>
                <div class="p-small t-grey">Ответим в течение 24 часов</div>
              </div>
            </div>
            
            <div class="flex gap-small pd-small bg-light radius-small">
              <Globe class="i-small fill-main" />
              <div>
                <div class="p-small t-grey uppercase">Веб-сайт</div>
                <div>{{ organizationData?.contacts?.website }}</div>
                <div class="p-small t-grey">Официальный сайт</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Адреса -->
        <div>
          <h3 class="h4 mn-b-small">Наши адреса</h3>
          <div class="flex flex-column gap-small">
            <div class="pd-small bg-light radius-small">
              <div class="flex gap-micro mn-b-micro">
                <MapPin class="i-small fill-main" />
                <div class="t-semi">Главный офис</div>
              </div>
              <div class="mn-b-small">{{ organizationData?.contacts?.address }}</div>
              <div class="flex gap-micro mn-b-small">
                <Clock class="i-small fill-grey" />
                <span class="p-small t-grey">Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</span>
              </div>
              <div class="flex gap-micro">
                <span class="bg-main-nano pd-micro radius-small p-small">Парковка</span>
                <span class="bg-main-nano pd-micro radius-small p-small">Wi-Fi</span>
                <span class="bg-main-nano pd-micro radius-small p-small">Кофе-зона</span>
              </div>
            </div>
            
            <div class="pd-small bg-light radius-small">
              <div class="flex gap-micro mn-b-micro">
                <MapPin class="i-small fill-main" />
                <div class="t-semi">Коворкинг</div>
              </div>
              <div class="mn-b-small">г. Москва, ул. Арбат, д. 25, 3 этаж</div>
              <div class="flex gap-micro mn-b-small">
                <Clock class="i-small fill-grey" />
                <span class="p-small t-grey">Круглосуточно</span>
              </div>
              <div class="flex gap-micro">
                <span class="bg-main-nano pd-micro radius-small p-small">24/7</span>
                <span class="bg-main-nano pd-micro radius-small p-small">Переговорные</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Последние посты -->
    <div class="bg-white pd-medium radius-extra bs-black-small br-1px mn-b-extra">
      <h2 class="h3 t-main flex-align-center gap-small mn-b-medium">
        <FileText class="w-2r h-2r fill-main" />
        Последние посты
      </h2>
    </div>

    <!-- Расписание ивентов -->
   <div class="bg-white pd-medium radius-medium mn-b-big">
      <h2 class="h3 t-main flex gap-small mn-b-medium">
        <Calendar class="i-medium fill-main" />
        Расписание ивентов
      </h2>
      
      <div class="flex flex-column gap-medium">
        <div
          v-for="event in organizationState.events"
          :key="event.id"
          class="flex gap-medium pd-small bg-light radius-small"
        >
          <!-- Дата -->
          <div class="flex flex-column flex-center bg-main pd-small radius-small t-white w-5r h-5r">
            <span class="h4">{{ getEventDay(event.date) }}</span>
            <span class="p-small uppercase">{{ getEventMonth(event.date) }}</span>
          </div>
          
          <!-- Информация -->
          <div class="flex-child-1">
            <h4 class="t-semi mn-b-micro">{{ event.title }}</h4>
            <p class="p-small t-grey mn-b-small">{{ event.description }}</p>
            <div class="flex gap-medium p-small t-grey">
              <div class="flex gap-micro">
                <Clock class="i-small fill-grey" />
                <span>{{ event.time }}</span>
              </div>
              <div class="flex gap-micro">
                <MapPin class="i-small fill-grey" />
                <span>{{ event.location }}</span>
              </div>
            </div>
          </div>
          
          <!-- Кнопка -->
          <button class="bg-main pd-small radius-small t-white">
            Участвовать
          </button>
        </div>
      </div>
    </div>

    <!-- Галерея -->
    <div class="bg-white pd-medium radius-extra bs-black-small br-1px mb-extra">
      <h2 class="h3 t-main flex-align-center gap-small mn-b-нedium">
        <Image class="w-2r h-2р fill-main" />
        Галерея
      </h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Users from '@martyrs/src/modules/icons/entities/IconGroups.vue'
import ArrowRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue'
import MapPin from '@martyrs/src/modules/icons/entities/IconAddress.vue'
import Phone from '@martyrs/src/modules/icons/entities/IconPhone.vue'
import Mail from '@martyrs/src/modules/icons/entities/IconEmail.vue'
import Globe from '@martyrs/src/modules/icons/entities/IconHome.vue'
import FileText from '@martyrs/src/modules/icons/entities/IconFile.vue'
import Heart from '@martyrs/src/modules/icons/navigation/IconHeart.vue'
import Calendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue'
import Clock from '@martyrs/src/modules/icons/entities/IconTime.vue'
import Image from '@martyrs/src/modules/icons/entities/IconGallery.vue'
import Share2 from '@martyrs/src/modules/icons/actions/IconOpenLink.vue'
import CheckCircle from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue'
import Crown from '@martyrs/src/modules/icons/entities/IconFeatured.vue'
import Shield from '@martyrs/src/modules/icons/entities/IconLock.vue'
import MessageCircle from '@martyrs/src/modules/icons/socials/telegram.vue'
import Play from '@martyrs/src/modules/icons/navigation/IconPlay.vue'

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as organization from '@martyrs/src/modules/organizations/store/organizations.js'
import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js'
import ButtonToggleMembership from '@martyrs/src/modules/organizations/components/elements/ButtonToggleMembership.vue'

const router = useRouter()
const route = useRoute()

const organizationData = ref(null)
const organizationState = ref({
  owner: {
    id: 1,
    name: 'Алексей Петров',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  admins: [
    {
      id: 2,
      name: 'Мария Сидорова',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: 3,
      name: 'Дмитрий Иванов',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    }
  ],
  featuredMembers: [
    {
      id: 4,
      name: 'Анна Козлова',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: 5,
      name: 'Сергей Волков',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    }
  ],
  address: {
    main: 'г. Москва, ул. Тверская, д. 15, оф. 301'
  },
  contacts: {
    phone: '+7 (495) 123-45-67',
    email: 'info@digitalhub.com',
    website: 'www.digitalhub.com'
  },
  posts: [
    {
      id: 1,
      title: 'Новые тренды в веб-разработке',
      excerpt: 'Обзор современных технологий и подходов',
      image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
      date: new Date('2024-01-15'),
      likes: 42
    },
    {
      id: 2,
      title: 'Мастер-класс по React',
      excerpt: 'Изучаем хуки и context API',
      image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
      date: new Date('2024-01-10'),
      likes: 28
    },
    {
      id: 3,
      title: 'Дизайн-системы в 2024',
      excerpt: 'Как создать масштабируемую дизайн-систему',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
      date: new Date('2024-01-05'),
      likes: 35
    },
    {
      id: 4,
      title: 'AI в современной разработке',
      excerpt: 'Как искусственный интеллект меняет подходы к программированию',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
      date: new Date('2024-01-01'),
      likes: 67
    }
  ],
  events: [
    {
      id: 1,
      title: 'Хакатон "Будущее AI"',
      description: '48-часовой хакатон по разработке AI-решений',
      date: new Date('2024-02-15'),
      time: '10:00 - 18:00',
      location: 'Технопарк Сколково'
    },
    {
      id: 2,
      title: 'Воркшоп по TypeScript',
      description: 'Углубленное изучение TypeScript для фронтенда',
      date: new Date('2024-02-20'),
      time: '14:00 - 17:00',
      location: 'Офис DIH'
    },
    {
      id: 3,
      title: 'Нетворкинг meetup',
      description: 'Встреча IT-сообщества для общения и обмена опытом',
      date: new Date('2024-02-25'),
      time: '19:00 - 22:00',
      location: 'Coworking Space'
    }
  ],
  about: 'Digital Innovation Hub - это динамично развивающееся сообщество профессионалов в области цифровых технологий. Мы объединяем разработчиков, дизайнеров, предпринимателей и энтузиастов, которые стремятся создавать инновационные решения и формировать будущее IT-индустрии.',
  stats: {
    members: 1250,
    events: 45,
    projects: 23,
    posts: 156
  },
  gallery: [
    {
      id: 1,
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      alt: 'Команда на хакатоне'
    },
    {
      id: 2,
      url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      alt: 'Воркшоп по программированию'
    },
    {
      id: 3,
      url: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      alt: 'Презентация проекта'
    },
    {
      id: 4,
      url: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      alt: 'Офис компании'
    }
  ],
  socialLinks: [
    {
      platform: 'Telegram',
      url: 'https://t.me/digitalhub'
    },
    {
      platform: 'VK',
      url: 'https://vk.com/digitalhub'
    },
    {
      platform: 'YouTube',
      url: 'https://youtube.com/digitalhub'
    }
  ]
})

const goToMembersPage = () => console.log('Переход на страницу участников')
const formatDate = date => date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const getEventDay = date => String(date.getDate()).padStart(2, '0')
const getEventMonth = date => date.toLocaleDateString('ru-RU', { month: 'short' })
const openGallery = image => console.log('Открытие галереи:', image)
const getSocialIcon = platform => {
  switch (platform) {
    case 'Telegram': return MessageCircle
    case 'VK': return Users
    case 'YouTube': return Play
    default: return Share2
  }
}

onMounted(async () => {
  try {
    let result = await organization.actions.read({
      _id: route.params._id, 
      user: auth.state.user._id,
      lookup: ['memberships']
    })

    organizationData.value = result[0]

    await membershipsStore.read({ target: route.params._id })

    if (typeof gtag === 'function') {
      gtag('event', 'view_organization', {
        organization_id: route.params._id,
        organization_name: organizationData.value?.profile?.name || 'unknown',
        page_path: window.location.pathname,
        user_id: auth.state.user._id || 'anonymous',
        timestamp: new Date().toISOString()
      })
    }

    console.log('Компонент страницы организации загружен')
  } catch (error) {
    console.error('Ошибка при загрузке организации:', error)
  }
})
</script>
