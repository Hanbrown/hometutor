<script setup>
import IconButton from './IconButton.vue';
const emit = defineEmits(["saved"]);
</script>
<template>
    <div id="rate-menu">
        <label>Default Rate: $</label>
        <input id="rate-field" type="text" :value="default" />
        <label>/hour&nbsp;</label>
        <icon-button classes="btn btn-save" label="Save rate" base="save" @clicked="emit(`saved`)"></icon-button>
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
