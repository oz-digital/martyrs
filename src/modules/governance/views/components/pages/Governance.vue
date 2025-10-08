<template>
  <div class="governance-main pd-big">
    <header class="mn-b-big t-center">
      <h1 class="h2 mn-b-medium">Governance</h1>
      <p class="p-medium">Participate in OZ DAO governance through initiatives, tasks, and voting</p>
    </header>

    <div class="cols-3 mobile:cols-1 gap-regular">
      <router-link
        :to="{ name: 'Initiatives' }"
        class="bg-light radius-medium pd-big hover-scale-1 transition-cubic"
      >
        <h3 class="h4 mn-b-small">Initiatives</h3>
        <p>Browse and create initiatives for the DAO</p>
      </router-link>

      <router-link
        :to="{ name: 'Tasks' }"
        class="bg-light radius-medium pd-big hover-scale-1 transition-cubic"
      >
        <h3 class="h4 mn-b-small">Tasks</h3>
        <p>View and manage tasks for DAO projects</p>
      </router-link>

      <router-link
        :to="{ name: 'Votings' }"
        class="bg-light radius-medium pd-big hover-scale-1 transition-cubic"
      >
        <h3 class="h4 mn-b-small">Votings</h3>
        <p>Participate in DAO voting and proposals</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
  color: inherit;
}
</style>
