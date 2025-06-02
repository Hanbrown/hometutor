<template>
    <button class="btn btn-manage" @click="onClick">Manage</button>
</template>

<script>
export default {
    name: "ManageBtn",
    methods: {
        onClick() {
            console.log("Mischief Managed");
        }
    }
}
// TODO: Add new student when this button is clicked
</script>