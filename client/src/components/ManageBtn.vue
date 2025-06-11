<script setup>
import { ref, defineEmits } from "vue";

const keyword = ref("pencil");
const emit = defineEmits(["clicked"]);

const swap = (shouldSwitch) => {
    if (shouldSwitch) {
        if (keyword.value === "pencil") {
            keyword.value = "caret-up";
        }
        else {
            keyword.value = "pencil";
        }
    }
    
    emit("clicked");

    return {
        keyword,
        swap
    }
}

</script>

<template>
    <button class="btn btn-manage" @click="swap(should_switch)"><font-awesome-icon :icon="['fas', keyword]" /></button>
</template>

<script>
export default {
    name: "ManageBtn",
    props: {
        should_switch: {required: false, default: false, type: Boolean},
    }
}
// TODO: Add new student when this button is clicked
</script>