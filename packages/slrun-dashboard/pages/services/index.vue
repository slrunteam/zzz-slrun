<template>
  <div class="title">
    <v-card-title>
      Services
      <v-spacer></v-spacer>
      <v-text-field
        append-icon="search"
        label="Search"
        single-line
        hide-details
        v-model="search"
      ></v-text-field>
    </v-card-title>
    <v-data-table
      v-bind:headers="headers"
      v-bind:items="items"
      v-bind:search="search"
      v-bind:pagination.sync="pagination"
      class="elevation-1">
      <template slot="headerCell" scope="props">
        <span v-tooltip:bottom="{ 'html': props.header.text }">
          {{ props.header.text }}
        </span>
      </template>
      <template slot="items" scope="props">
        <td>
          <nuxt-link :to="{ name: 'services-id', params: { id: props.item.id }}">
            {{ props.item.id }}
          </nuxt-link>
        </td>
        <td>
          <a :href="props.item.url" target="_blank">
            {{ props.item.url }} 
          </a>
        </td>
      </template>
      <template slot="pageText" scope="{ pageStart, pageStop }">
        From {{ pageStart }} to {{ pageStop }}
      </template>
    </v-data-table>
  </div>
</template>
<script>
import apiClient from '~/plugins/apiClient'

export default {
  async asyncData () {
    const { data } = await apiClient.get('/services')
    return {
      search: '',
      pagination: { rowsPerPage: 10 },
      headers: [
        { text: 'Id', align: 'left', value: 'id', sortable: true },
        { text: 'Url', align: 'left', value: 'url', sortable: true }
      ],
      items: data
    }
  },
  head () {
    return {
      title: 'SL.RUN Dashboard'
    }
  }
}
</script>
