<template>
  <div class="title">
    <div class="pb-3">
      <h3>{{ serviceId }}</h3>
      <strong>Url: <a :href="serviceUrl" target="_blank">{{ serviceUrl }}</a></strong>
    </div>
    <v-layout row-md column child-flex-md>
      <v-flex md4>
        <line-chart class="chart-stats" :options="{ maintainAspectRatio: false }" :chart-data="requestCollection"></line-chart>
      </v-flex>
      <v-flex md4>
        <line-chart class="chart-stats" :options="{ maintainAspectRatio: false }" :chart-data="responseCollection"></line-chart>
      </v-flex>
      <v-flex md4>
        <line-chart class="chart-stats" :options="{ maintainAspectRatio: false }" :chart-data="dataTransferredCollection"></line-chart>
      </v-flex>
    </v-layout>
    <v-card-title>
      Requests
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
        <tr style="cursor:pointer" @click="expanded[props.item.id] = !expanded[props.item.id]">
          <td>{{ props.item.reqUrl }}</td>
          <td>{{ props.item.reqMethod }}</td>
          <td>{{ props.item.resStatusCode }}</td>
          <td class="text-xs-right">{{ formatedBytes(props.item.resSize) }}</td>
          <td class="text-xs-right">{{ formatedTime(props.item.resTime) }}</td>
          <td class="text-xs-right">{{ formatedCreatedAt(props.item.createdAt) }}</td>
        </tr>
        <tr class="expand" v-show="expanded[props.item.id]">
          <td colspan="100%">
            <v-expansion-panel>
              <v-expansion-panel-content v-model="expanded[props.item.id]">
                <v-container>
                  <p> <strong>Id:</strong> {{ props.item.id }}</p>
                  <p> <strong>Url:</strong> {{ props.item.reqUrl }}</p>
                  <p> <strong>Method:</strong> {{ props.item.reqMethod }}</p>
                  <p> <strong>Headers:</strong> </p>
                  <p v-for="(value, key) in props.item.reqHeaders">
                    <strong> &nbsp; {{ key }}:</strong> {{ value }}
                  </p>
                  <v-btn block secondary dark v-on:click.native="replay(props.item)">Replay</v-btn>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </td>
        </tr>
      </template>
      <template slot="pageText" scope="{ pageStart, pageStop }">
        From {{ pageStart }} to {{ pageStop }}
      </template>
    </v-data-table>
  </div>
</template>
<script>
import lineChart from '~/components/line_chart'
import apiClient from '~/plugins/apiClient'
import filesize from 'filesize'
import moment from 'moment'

const size = filesize.partial({ base: 10, round: 1 })

const getInitialStatsState = () => ({
  serviceId: '',
  requestCollection: {
    labels: [],
    datasets: [
      {
        label: 'Requests',
        backgroundColor: '#D87D47',
        borderColor: '#D87D47',
        fill: false,
        data: []
      },
      {
        label: 'Error Requests',
        backgroundColor: '#2E8C75',
        borderColor: '#2E8C75',
        fill: false,
        data: []
      }
    ]
  },
  responseCollection: {
    labels: [],
    datasets: [
      {
        label: 'Average Response Time (ms)',
        backgroundColor: '#95400D',
        borderColor: '#95400D',
        fill: false,
        data: []
      }
    ]
  },
  dataTransferredCollection: {
    labels: [],
    datasets: [
      {
        label: 'Data Usage (KB)',
        backgroundColor: '#FFC4A1',
        borderColor: '#FFC4A1',
        fill: false,
        data: []
      }
    ]
  }
})

export default {
  components: {
    lineChart
  },
  methods: {
    formatedBytes: (bytes) => {
      return size(bytes)
    },
    formatedTime: (time) => {
      return `${time} ms`
    },
    formatedCreatedAt: (createdAt) => {
      return moment(createdAt).fromNow()
    },
    formatedHeaders: (headers) => {
      return JSON.stringify(headers, null, 4);
    },
    replay: (request) => {
      const host = request.reqHeaders['host']
      delete request.reqHeaders['host']
      delete request.reqHeaders['connection']
      delete request.reqHeaders['referer']
      delete request.reqHeaders['accept-encoding']
      delete request.reqHeaders['user-agent']
      delete request.reqHeaders['origin']
      delete request.reqHeaders['upgrade-insecure-requests']
      delete request.reqHeaders['cookie']
      delete request.reqHeaders['x-real-ip']
      delete request.reqHeaders['content-length']
      delete request.reqHeaders['cache-control']
      const data = request.reqBody ? request.reqBody : null
      const replayOptions = {
        baseURL: `http://${host}/`,
        url: request.reqUrl,
        method: request.reqMethod,
        headers: request.reqHeaders,
        data
      }
      apiClient.post('/replay', replayOptions)
    }
  },
  asyncData ({ params, error }) {
    return apiClient.get('/services/' + params.id)
      .then((res) => {
        const stats = getInitialStatsState()
        stats.serviceId = res.data.id
        stats.serviceUrl = res.data.url
        const requests = res.data.requests
        const statsRequest = requests.reduce((re = {}, request) => {
          if (moment(request.createdAt).isBefore(moment(requests[requests.length - 1].createdAt).subtract(1, 'hours'))) {
            return re
          }
          const time = moment(request.createdAt).format('HH:mm:ss')
          if (time in re) {
            if (request.resStatusCode != 200) {
              re[time]['ErrorRequests']++
            } else {
              re[time]['Requests']++
            }
            re[time]['ResponseTime'] += request.resTime
            re[time]['Responses']++
            re[time]['DataTransferred'] += request.resSize
          } else {
            re[time] = {}
            if (request.resStatusCode != 200) {
              re[time]['ErrorRequests'] = 1
              re[time]['Requests'] = 0
            } else {
              re[time]['ErrorRequests'] = 0
              re[time]['Requests'] = 1
            }
            re[time]['ResponseTime'] = request.resTime
            re[time]['Responses'] = 1
            re[time]['DataTransferred'] = request.resSize
          }
          return re
        }, {})
        Object.keys(statsRequest).forEach(function (key) {
          stats.requestCollection.labels.push(key)
          stats.requestCollection.datasets[0].data.push(statsRequest[key]['Requests'])
          stats.requestCollection.datasets[1].data.push(statsRequest[key]['ErrorRequests'])
          stats.responseCollection.labels.push(key)
          stats.responseCollection.datasets[0].data.push((statsRequest[key]['ResponseTime'] / statsRequest[key]['Responses']).toFixed(3))
          stats.dataTransferredCollection.labels.push(key)
          stats.dataTransferredCollection.datasets[0].data.push(statsRequest[key]['DataTransferred'] / 1000)
        })
        const { serviceId, serviceUrl, requestCollection, responseCollection, dataTransferredCollection } = stats
        const expanded = {}
        requests.forEach((request) => {
          expanded[request.id] = false
        })
        return {
          serviceId,
          serviceUrl,
          requestCollection,
          responseCollection,
          dataTransferredCollection,
          search: '',
          expanded,
          pagination: { rowsPerPage: 25, sortBy: 'createdAt', descending: true },
          headers: [
            { text: 'Url', align: 'left', value: 'reqUrl', sortable: true },
            { text: 'Method', align: 'left', value: 'reqMethod', sortable: true },
            { text: 'Status', align: 'left', value: 'resStatusCode', sortable: true },
            { text: 'Size', align: 'right', value: 'resSize', sortable: true },
            { text: 'Time', align: 'right', value: 'resTime', sortable: true },
            { text: 'Created At', align: 'right', value: 'createdAt', sortable: true }
          ],
          items: requests
        }
      })
      .catch((e) => {
        error({ statusCode: 404, message: 'Service not found' })
      })
  },
  head () {
    return {
      title: `SL.RUN Dashboard - ${this.serviceId}`
    }
  }
}
</script>
<style scoped>
.chart-stats {
  height: 250px;
}
tr.expand td {
  padding: 0 !important;
}
tr.expand .expansion-panel {
  box-shadow: none;
}
tr.expand .expansion-panel li {
  border: none;
}
</style>
