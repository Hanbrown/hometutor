<script setup>
import { defineEmits } from "vue";

const emit = defineEmits(["clicked"]);
</script>

<template>
    <button :class="this.classes" @click="switchIcon(); emit('clicked')">
        <font-awesome-icon :icon="['fas', the_icon]" />
        <slot />
    </button>
</template>

<script>
export default {
    name: "IconButton",
    props: {
        base: { required: false, default: "plus", type: String },
        alt: { required: false, default: "", type: String },
        classes: { required: false, default: "btn", type: String },
    },
    data () {
        return { the_icon: this.base };
    },
    methods: {
        switchIcon() {
            if (this.alt !== "" && this.the_icon === this.base) {
                this.the_icon = this.alt;
            }
            else if (this.alt !== "") {
                this.the_icon = this.base;
            }

        }
    }
};
</script>
