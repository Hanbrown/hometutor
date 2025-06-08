<template>
    <button class="btn btn-del" @click="onClick"><font-awesome-icon icon="minus" /></button>
</template>

<script>
export default {
    name: "DeleteStudent",
    methods: {
        onClick() {
            console.log("Deleted");
        }
    }
}
// TODO: Add new student when this button is clicked
</script>