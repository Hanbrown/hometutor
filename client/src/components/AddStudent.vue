<template>
    <button class="btn btn-add" @click="onClick">+</button>
</template>

<script>
export default {
    name: "AddStudent",
    methods: {
        onClick() {
            console.log("CLick it or TIcket");
        }
    }
}
// TODO: Add new student when this button is clicked
</script>