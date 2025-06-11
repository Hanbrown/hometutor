<script setup>
import { defineEmits } from "vue";

const emit = defineEmits(["saved"]);

const saveClick = () => {
    emit("saved");

}
</script>

<template>
    <div class="edit-name">
        <label for="fname">Name</label>
        <input type="text" id="fname" :placeholder="fname" />
        <input type="text" id="lname" :placeholder="lname" />
        <button class="btn btn-save" @click="saveClick()"><font-awesome-icon icon="save" /></button>
    </div>
</template>

<script>
export default {
    name: "NameMenu",
    props: {
        fname: {required: true, default: "Joost", type: String},
        lname: {required: true, default: "Doe", type: String},
    }
};
</script>