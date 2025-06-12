<script setup>
const emit = defineEmits("saved");
</script>

<template>
    <button class="btn btn-save" @click="emit(`saved`)"><font-awesome-icon icon="plus" /></button>
</template>

<script>
export default {
    name: "SaveButton",
    methods: {
        onClick() {
            console.log("Saved");
        }
    }
}
// TODO: Add new student when this button is clicked
</script>