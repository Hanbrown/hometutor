<script setup>
import IconButton from './IconButton.vue';
const emit = defineEmits(["saved"]);
</script>
<template>
    <div id="rate-menu">
        <label>Default Rate: $</label>
        <input id="rate-field" type="text" :value="default" />
        <label>/hour&nbsp;</label>
        <icon-button classes="btn btn-add" label="Save rate" base="save" @clicked="emit(`saved`)"></icon-button>
        <span class="spinner hidden"><font-awesome-icon icon="rotate" /></span>
    </div>
</template>

<script>

export default {
    name: "RateMenu",
    props: {
        default: {required: true, default: 65.00, type: Number},
    },
    components: {
        IconButton
    }
};
</script>
