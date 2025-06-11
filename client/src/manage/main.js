import '../assets/main.css'
import '../assets/responsive.css'

import { createApp } from 'vue'
import App from './App.vue'

import { library } from "@fortawesome/fontawesome-svg-core";
import { faPrint, faUser, faPlus, faMinus, faListCheck, faPencil, faCaretUp, faSave, faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faPrint);
library.add(faUser);
library.add(faPlus);
library.add(faMinus);
library.add(faListCheck);
library.add(faPencil);
library.add(faCaretUp);
library.add(faCaretLeft);
library.add(faSave);

createApp(App).component("font-awesome-icon", FontAwesomeIcon).mount('#app')
