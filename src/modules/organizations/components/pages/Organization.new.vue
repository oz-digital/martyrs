<template>
  <div class="w-100 mn-x-auto pd-x-regular w-max-66r">
    <!-- Профиль организации -->
    <div v-if="organizationData" class="mn-b-extra">
      <div class="w-100 h-20r radius-regular o-hidden pos-relative">
        <img
          :src="organizationData?.profile?.photo"
          :alt="organizationData?.profile?.name"
          class="w-100 h-100 object-fit-cover"
        />
        <div class="pos-absolute pos-t-0 pos-l-0 pos-r-0 pos-b-0 bg-black-transp-40 d-flex flex-align-end pd-medium">
          <div class="d-flex gap-medium mn-l-auto">
            <div class="t-white t-center">
              <span class="p-big t-bold t-white">{{ organizationState.stats.members }}</span>
              <span class="p-small uppercase t-white-transp-90">участников</span>
            </div>
            <div class="t-white t-center">
              <span class="p-big t-bold t-white">{{ organizationState.stats.events }}</span>
              <span class="p-small uppercase t-white-transp-90">событий</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white radius-regular pd-medium pos-relative mn-t-regular bs-black-small br-1px">
        <div class="d-flex flex-nowrap flex-align-start gap-medium">
          <div class="pos-relative flex-shrink-0">
            <img
              :src="organizationData?.profile?.photo"
              :alt="organizationData?.profile?.name"
              class="w-8r h-8r radius-big br-3px object-fit-cover bs-black-small"
            />
            <div
              class="pos-absolute pos-b-1 pos-r-1 w-2r h-2r radius-big br-3px bs-black-small"
              :class="{
                'bg-green-nice': organizationState.status === 'active',
                'bg-grey': organizationState.status === 'inactive',
                'bg-yellow-nice': organizationState.status === 'busy'
              }"
            ></div>
            <div class="pos-absolute pos-t-1 pos-l-1 pos-r-1 pos-b-1 br-2px br-main br-pulse opacity-30"></div>
          </div>
          <div class="flex-grow-1 pd-t-regular">
            <div class="d-flex flex-align-center gap-small mn-b-small">
              <h1 class="h1 font-main t-bold t-main">{{ organizationData?.profile?.name }}</h1>
              <div
                v-if="organizationData?.official"
                class="d-flex flex-align-center gap-nano bg-second pd-nano radius-extra bs-black-small t-white p-small"
              >
                <CheckCircle class="w-2r h-2r fill-white" />
                <span>Verified</span>
              </div>
            </div>
            <p class="p-regular t-grey mn-b-medium">{{ organizationData?.profile?.description }}</p>
            <div class="d-flex flex-wrap gap-medium mn-b-medium">
              <div class="d-flex flex-align-center gap-nano bg-third pd-small radius-extra t-dark">
                <Calendar class="w-2r h-2r fill-main" />
                <!-- <span>Создана {{ formatDate(organizationData?.createdAt) }}</span> -->
              </div>
              <div class="d-flex flex-align-center gap-nano bg-third pd-small radius-extra t-dark">
                <Globe class="w-2r h-2r fill-main" />
                <span>{{ organizationData?.types?.[0] }}</span>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-nano mn-b-medium">
              <span
                v-for="tag in organizationData?.profile?.tags"
                :key="tag"
                class="bg-main-transp-15 t-main pd-thin radius-extra"
              >
                {{ tag }}
              </span>
            </div>
            <div class="d-flex flex-wrap gap-small">
              <button class="bg-main pd-small radius-extra t-white bs-black-small hover-scale-1 transition-ease-in-out d-flex flex-align-center gap-nano">
                <Users class="w-2r h-2r fill-white" />
                Присоединиться
              </button>
              <ButtonToggleMembership
                v-if="organizationData"
                :user="auth.state.user"
                type="organization"
                role="subscriber"
                :target="organizationData"
                :status="memberships.state.isSubscriber"
                text="Подписаться"
                class="bg-light pd-small radius-extra t-dark br-1px br-light hover-bg-third hover-t-main transition-ease-in-out d-flex flex-align-center gap-nano"
              />
              <button class="bg-light pd-small radius-extra t-dark br-1px br-light hover-bg-third hover-t-main transition-ease-in-out d-flex flex-align-center gap-nano">
                <Share2 class="w-2r h-2r fill-main" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- О нас и соцсети -->
    <div v-if="organizationData" class="d-grid cols-2-1_3 gap-medium mn-b-extra mobile-only:cols-1">
      <div class="bg-white pd-medium radius-extra bs-black-small br-1px">
        <h3 class="h4 t-main t-bold mn-b-small">О нас</h3>
        <p class="p-regular t-dark mn-b-medium">{{ organizationData?.profile?.description }}</p>
        <div class="d-flex gap-medium">
          <div class="t-center">
            <span class="p-big t-bold t-main">{{ organizationState.stats.projects }}</span>
            <span class="p-small uppercase t-grey">проектов</span>
          </div>
          <div class="t-center">
            <span class="p-big t-bold t-main">{{ organizationState.stats.posts }}</span>
            <span class="p-small uppercase t-grey">постов</span>
          </div>
        </div>
      </div>
      <div class="bg-white pd-medium radius-extra bs-black-small br-1px">
        <h3 class="h4 t-main t-bold mn-b-small">Мы в соцсетях</h3>
        <div class="d-flex flex-column gap-small">
          <a
            v-if="organizationData?.socials?.telegram"
            :href="organizationData.socials.telegram"
            target="_blank"
            class="d-flex flex-align-center gap-small pd-small bg-white radius-extra bs-black-small br-1px hover-bg-second hover-fill-white transition-ease-in-out"
          >
            <MessageCircle class="w-2r h-2r fill-main" />
            <span class="t-dark font-second">Telegram</span>
          </a>
          <a
            v-if="organizationData?.socials?.facebook"
            :href="organizationData.socials.facebook"
            target="_blank"
            class="d-flex flex-align-center gap-small pd-small bg-white radius-extra bs-black-small br-1px hover-bg-second hover-fill-white transition-ease-in-out"
          >
            <Users class="w-2r h-2r fill-main" />
            <span class="t-dark font-second">Facebook</span>
          </a>
          <a
            v-if="organizationData?.socials?.instagram"
            :href="organizationData.socials.instagram"
            target="_blank"
            class="d-flex flex-align-center gap-small pd-small bg-white radius-extra bs-black-small br-1px hover-bg-second hover-fill-white transition-ease-in-out"
          >
            <Play class="w-2r h-2r fill-main" />
            <span class="t-dark font-second">Instagram</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Участники -->
    <div class="bg-white pd-medium radius-extra bs-black-small br-1px mn-b-extra">
      <div class="d-flex justify-between flex-align-center mn-b-medium">
        <h2 class="h3 t-main flex-align-center gap-small">
          <Users class="w-2r h-2r fill-main" />
          Участники
        </h2>
        <button
          class="pd-small bg-light radius-small t-dark br-1px br-light hover-bg-third hover-t-main transition-ease-in-out d-flex flex-align-center gap-nano"
          @click="goToMembersPage"
        >
          Все участники
          <ArrowRight class="w-2r h-2r fill-main" />
        </button>
      </div>
      <div class="d-grid cols-auto-1fr gap-medium mobile-only:cols-1">
        <div class="pos-relative d-flex flex-align-center gap-small pd-small radius-small bs-black-small br-1px bg-main-transp-10 hover-scale-1 transition-ease-in-out">
          <div class="pos-absolute pos-t-1 pos-l-1 w-2r h-2r radius-round br-3px bg-yellow-nice bs-black-small"></div>
          <img
            :src="organizationState.owner.avatar"
            :alt="organizationState.owner.name"
            class="w-6r h-6r radius-big object-fit-cover br-2px"
          />
          <div class="flex-grow-1">
            <div class="t-medium t-main">{{ organizationState.owner.name }}</div>
            <div class="p-small t-orange-nice t-bold">Владелец</div>
            <div class="p-small t-grey">онлайн</div>
          </div>
          <div class="w-3r h-3r radius-extra bg-fifth d-flex flex-align-center flex-justify-center bs-black-small">
            <Crown class="w-2r h-2r fill-white" />
          </div>
        </div>
        <div
          v-for="admin in organizationState.admins"
          :key="admin.id"
          class="pos-relative d-flex flex-align-center gap-small pd-small radius-small bs-black-small br-1px bg-third-transp-15 hover-scale-1 transition-ease-in-out"
        >
          <div class="pos-absolute pos-t-1 pos-l-1 w-2r h-2r radius-round br-3px bg-second bs-black-small"></div>
          <img
            :src="admin.avatar"
            :alt="admin.name"
            class="w-6r h-6r radius-big object-fit-cover br-2px"
          />
          <div class="flex-grow-1">
            <div class="t-medium t-main">{{ admin.name }}</div>
            <div class="p-small t-main t-bold">Администратор</div>
            <div class="p-small t-grey">2 часа назад</div>
          </div>
          <div class="w-3r h-3r radius-extra bg-second d-flex flex-align-center flex-justify-center bs-black-small">
            <Shield class="w-2r h-2r fill-white" />
          </div>
        </div>
        <div
          v-for="member in organizationState.featuredMembers"
          :key="member.id"
          class="pos-relative d-flex flex-align-center gap-small pd-small radius-small bs-black-small br-1px hover-scale-1 transition-ease-in-out"
        >
          <div class="pos-absolute pos-t-1 pos-l-1 w-2r h-2r radius-round br-3px bg-green-nice bs-black-small"></div>
          <img
            :src="member.avatar"
            :alt="member.name"
            class="w-6r h-6r radius-big object-fit-cover br-2px"
          />
          <div class="flex-grow-1">
            <div class="t-medium t-main">{{ member.name }}</div>
            <div class="p-small t-dark">Участник</div>
            <div class="p-small t-grey">вчера</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Контакты и адреса -->
    <div class="bg-white pd-medium radius-extra bs-black-small br-1px mn-b-extra">
      <h2 class="h3 t-main flex-align-center gap-small mn-b-medium">
        <MapPin class="w-2r h-2r fill-main" />
        Контакты и адреса
      </h2>
      <div class="d-grid cols-2-1_3 gap-medium mobile-only:cols-1">
        <div>
          <h3 class="h4 t-main t-bold mn-b-small">Связь с нами</h3>
          <div class="d-flex flex-column gap-small">
            <div class="d-flex flex-align-center gap-medium pd-small bg-third-transp-15 radius-small br-1px bs-black-small hover-bg-third hover-t-main transition-ease-in-out">
              <Phone class="w-2r h-2r fill-main" />
              <div>
                <div class="p-small uppercase t-grey mn-b-nano">Телефон</div>
                <div class="p-regular t-dark">{{ organizationData?.contacts?.phone }}</div>
                <div class="p-small t-grey">Пн-Пт 9:00-18:00</div>
              </div>
            </div>
            <div class="d-flex flex-align-center gap-medium pd-small bg-third-transp-15 radius-small br-1px bs-black-small hover-bg-third hover-t-main transition-ease-in-out">
              <Mail class="w-2r h-2r fill-main" />
              <div>
                <div class="p-small uppercase t-grey mn-b-nano">Email</div>
                <div class="p-regular t-dark">{{ organizationData?.contacts?.email }}</div>
                <div class="p-small t-grey">Ответим в течение 24 часов</div>
              </div>
            </div>
            <div class="d-flex flex-align-center gap-medium pd-small bg-third-transp-15 radius-small br-1px bs-black-small hover-bg-third hover-t-main transition-ease-in-out">
              <Globe class="w-2r h-2r fill-main" />
              <div>
                <div class="p-small uppercase t-grey mn-b-nano">Веб-сайт</div>
                <div class="p-regular t-dark">{{ organizationData?.contacts?.website }}</div>
                <div class="p-small t-grey">Официальный сайт</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 class="h4 t-main t-bold mn-b-small">Наши адреса</h3>
          <div class="d-flex flex-column gap-small">
            <div class="pd-small bg-third-transp-15 radius-small br-1px bs-black-small hover-bg-third hover-t-main transition-ease-in-out mn-b-small">
              <div class="d-flex flex-align-center gap-nano mn-b-nano">
                <MapPin class="w-2r h-2r fill-main" />
                <div class="t-medium t-main">Главный офис</div>
              </div>
              <div class="p-regular t-dark mn-b-nano">{{ organizationData?.contacts?.address }}</div>
              <div class="d-flex flex-align-center gap-nano mn-b-nано">
                <Clock class="w-2r h-2r fill-main" />
                <span class="p-small t-grey">Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</span>
              </div>
              <div class="d-flex gap-nano">
                <span class="bg-fifth-transp-15 t-main pd-thin radius-extra">Парковка</span>
                <span class="bg-fifth-transp-15 t-main pd-thin radius-extra">Wi-Fi</span>
                <span class="bg-fifth-transp-15 t-main pd-thin radius-extra">Кофе-зона</span>
              </div>
            </div>
            <div class="pd-small bg-third-transp-15 radius-small br-1px bs-black-small hover-bg-third hover-t-main transition-ease-in-out">
              <div class="d-flex flex-align-center gap-nano mn-b-нано">
                <MapPin class="w-2r h-2r fill-main" />
                <div class="t-medium t-main">Коворкинг</div>
              </div>
              <div class="p-regular t-dark mn-b-нано">г. Москва, ул. Арбат, д. 25, 3 этаж</div>
              <div class="d-flex flex-align-center gap-nano">
                <Clock class="w-2р h-2р fill-main" />
                <span class="p-small t-grey">Круглосуточно</span>
              </div>
              <div class="d-flex gap-nано">
                <span class="bg-fifth-transp-15 t-main pd-thin radius-extra">24/7</span>
                <span class="bg-fifth-transp-15 t-main pd-thин radius-extra">Переговорные</span>
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
      <div class="d-grid cols-auto-1fr gap-medium mobile-only:cols-1">
        <div
          v-for="post in organizationState.posts"
          :key="post.id"
          class="bg-white radius-small o-hidden br-1px bs-black-small hover-scale-1 transition-ease-in-out cursor-pointer"
        >
          <img :src="post.image" :alt="post.title" class="w-100 h-10r object-fit-cover" />
          <div class="pd-small">
            <h4 class="t-medium t-main mn-b-нано">{{ post.title }}</h4>
            <p class="p-small t-grey mn-б-small">{{ post.excerpt }}</p>
            <div class="d-flex justify-between flex-align-center t-grey p-small">
              <span>{{ formatDate(post.date) }}</span>
              <div class="d-flex flex-align-center gap-нано">
                <Heart class="w-2r h-2r fill-main" />
                <span>{{ post.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Расписание ивентов -->
    <div class="bg-white pd-medium radius-extra bs-black-small br-1px mn-b-extra">
      <h2 class="h3 t-main flex-align-center gap-small mn-б-medium">
        <Calendar class="w-2r h-2r fill-main" />
        Расписание ивентов
      </h2>
      <div class="d-flex flex-column gap-medium">
        <div
          v-for="event in organizationState.events"
          :key="event.id"
          class="d-flex flex-align-center gap-medium pd-small radius-small bs-black-small br-1px hover-scale-1 transition-ease-in-out mobile-only: flex-column"
        >
          <div class="d-flex flex-column flex-align-center bg-main pd-small radius-small bs-black-small br-1px mn-р-medium">
            <span class="p-бig t-white t-bold">{{ getEventDay(event.date) }}</span>
            <span class="p-small uppercase t-white">{{ getEventMonth(event.date) }}</span>
          </div>
          <div class="flex-grow-1">
            <h4 class="t-мedium t-main mn-b-нано">{{ event.title }}</h4>
            <p class="p-small t-grey mn-b-нedium">{{ event.description }}</p>
            <div class="d-flex gap-medium p-small t-grey">
              <div class="d-flex flex-align-center gap-нано">
                <Clock class="w-2r h-2r fill-main" />
                <span>{{ event.time }}</span>
              </div>
              <div class="d-flex flex-align-center gap-нано">
                <MapPin class="w-2r h-2р fill-main" />
                <span>{{ event.location }}</span>
              </div>
            </div>
          </div>
          <button class="bg-main pd-small radius-extra t-white bs-black-small hover-scale-1 transition-ease-in-out">
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
      <div class="d-grid cols-auto-1fr gap-small mobile-only:cols-2">
        <div
          v-for="image in organizationState.gallery"
          :key="image.id"
          class="o-hidden radius-small bs-black-small hover-scale-1 transition-ease-in-out cursor-pointer"
          @click="openGallery(image)"
        >
          <img :src="image.url" :alt="image.alt" class="w-100 h-10r object-fit-cover" />
        </div>
      </div>
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
import * as memberships from '@martyrs/src/modules/organizations/store/memberships.js'
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

    await memberships.actions.read({ target: route.params._id })

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
