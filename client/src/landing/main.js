import '../assets/main.css'
import '../assets/responsive.css'

import { createApp } from 'vue'
import App from './App.vue'

import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faPlus, faMinus, faPencil, faCaretUp, faSave, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faUser);
library.add(faPlus);
library.add(faMinus);
library.add(faPencil);
library.add(faCaretUp);
library.add(faSave);
library.add(faRotate);

createApp(App).component("font-awesome-icon", FontAwesomeIcon).mount('#app')
