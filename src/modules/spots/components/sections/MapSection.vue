<template>
  <section id="map" class="section">
    <div class="mn-b-big t-center title">
      <h2 class="" v-html="t('title')"></h2>
    </div>

    <div class="cols-2">
      <MapBlock 
      :name="t('map.title')" 
      map="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d988.2464207440368!2d98.32843645562768!3d7.791339890847109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30502f47783f9337%3A0x516fcf234b41baa0!2z4Lia4LmJ4Liy4LiZ4Lif4Li04LiZ4LiB4Lix4LiN!5e0!3m2!1sen!2sth!4v1671872245101!5m2!1sen!2sth"
      link="https://goo.gl/maps/Pvvow9B4uS9eEHP56" 
      :text="t('map.description')"
      />
      <MapBlock 
      :name="t('newplaces.title')" 
      :text="t('newplaces.description')"
      />
    </div>
  </section>
</template>


<script setup>
  import { ref, computed, onServerPrefetch, onMounted } from 'vue'

  import MapBlock from "@martyrs/src/modules/landing/components/blocks/MapBlock.vue"

  import { useI18n } from 'vue-i18n'
    
  const text = {
    messages: {
      en: {
        title: '<b>Fin.Kan House Is Our Partner</b><br>And Pickup Location 📍',
        subtitle: 'Buy CBD and high THC weed in-store at our central Weeder location',
        map: {
          title: '43 283 Soi Boathouse, Rawai 🏨',
          description: 'Opening hours from 18:00 to 24:00.'
        },
        newplaces: {
          title: 'New Places is Coming 👌',
          description: 'We are in the process of opening a new locations for faster delivery to all areas of Phuket. Subscribe to our social networks and expect news!'
        }
      },
      ru: {
        title: '<b>Fin.Kan House Наш Партнер</b><br>и Пункт Выдачи 📍',
        subtitle: 'Купите травку с КБД и высоким содержанием ТГК в центральном магазине Weeder.',
        map: {
          title: '43 283 Soi Boathouse, Rawai 🏨',
          description: 'Время работы с 18:00 до 24:00.'
        },
        newplaces: {
          title: 'Новые места на подходе 👌',
          description: 'Мы занимаемся открытием нового мест для более быстрой доставки во все районы Пхукеты. Подписыватесь на наши социальные сети и ожидайте новостей!'
        }
      }
    }
  }

  const { t } = useI18n(text)

</script>

<style lang="scss">
#map {
  padding-bottom: 0;
  
  .cols-2 {
      gap: 1rem;

      border-radius: 2rem;
      overflow: hidden;
      
      .col:first-of-type {
          display: flex;
          flex-direction: column;

          .button-link {color: #00ff88;}
      }
      .col:last-of-type {

          #gmap_canvas {
            // border-radius: 2rem;
            overflow: hidden;
            
             height: 100%;
              width: 100%;
          }
      }
  }
}
</style>
