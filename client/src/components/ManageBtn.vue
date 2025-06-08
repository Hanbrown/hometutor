<script setup>
import {ref} from "vue";

const keyword = ref("Manage");
const emit = defineEmits(["clicked"]);

const swap = () => {
    if (keyword.value === "Manage") {
        keyword.value = "Close";
    }
    else {
        keyword.value = "Manage";
    }
    
    emit("clicked");

    return {
        keyword,
        swap
    }
}

</script>

<template>
    <button class="btn btn-manage" @click="swap">{{ keyword }}</button>
</template>

<script>
export default {
    name: "ManageBtn",
    props: {
        id:             { required: true, default: 9999, type: Number },
        color_index:    { required: false, default: 0, type: Number },
        time_in:        { required: false, default: Date.now()-(1000*60*60), type: Date },
        time_out:       { required: false, default: Date.now(), type: Date },
        rate:           { required: true, default: 65, type: Number }
    }
}
// TODO: Add new student when this button is clicked
</script>