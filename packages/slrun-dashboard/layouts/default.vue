<template>
  <v-app height="415px" standalone>
    <v-navigation-drawer class="pb-0" persistent absolute height="100%" clipped disable-route-watcher v-model="drawer">
      <v-list dense>
        <v-list-tile v-for="item in items" :key="item.text" :to="item.to">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.text }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar>
      <v-toolbar-title>
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
      </v-toolbar-title>
      <v-toolbar-title>SL.RUN Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-container>
        <nuxt/>
      </v-container>
    </main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
    items: [
      { icon: 'home', text: 'Home', to: '/' },
    ]
  })
}
</script>

<style scoped>
  .title {
    padding-left: 20px;
  }
</style>
