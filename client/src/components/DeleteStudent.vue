<script setup>

const emit = defineEmits(["clicked"]);
</script>

<template>
    <button class="btn btn-del" @click="emit('clicked')"><font-awesome-icon icon="minus" />{{ long ? "&nbsp;Delete" : "" }}</button>
</template>

<script>
export default {
    name: "DeleteStudent",
    props: {
        long: { required: true, default: false, type: Boolean }
    }
}
// TODO: Add new student when this button is clicked
</script>