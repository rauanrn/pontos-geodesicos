
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Importar BootstrapVue
import {BootstrapVue3} from 'bootstrap-vue-3';


import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(BootstrapVue3);

app.mount('#app')
