<template>
  <section id="gift" class="section">

    <div class="t-center section-1-col">
      <p class="mn-b-small">
        Looking for a beautiful and stylish gift?
      </p>
      <h3 class="mn-b-medium">
        Gift Certificate is a simple way to donate money<br><b>and make suprise for someone</b>
      </h3>
      
      <router-link to="/catalog/products/7070249d-c84a-4bb4-bfac-a58b65353209">
        <button class="button">Buy now</button>
      </router-link>
    </div>

  </section>
</template>


<script setup>
  import { computed, onMounted, reactive, toRefs } from 'vue'
  
  import { useRoute,useRouter } from 'vue-router'
  const route = useRoute()
  const router = useRouter()
</script>

<style lang="scss">
#gift {
    b {
      color: #00ff88;
    }

   .section-1-col {
    display: block;
    padding: 10rem 3rem;
    color: black;
    border-radius: 2rem;
    background: #00ff88;
    background-image: url("@/assets/images/backgrounds/cerificat.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center bottom;
    overflow: hidden;
    .button {
      margin: 0 auto;
      background: white;
      color: #00ff88;
      // box-shadow: 0px 10px 24px rgba(0, 0, 0, 0.05);
      // border: 1px solid #f7f7f7;
      opacity: 1;

      &:hover {
         background: #00ff88;
      color: white;
      }
    }

  }
}

</style>
