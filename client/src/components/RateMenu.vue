<template>
    <div id="rate-menu">
        <h5>Default Rate: $</h5>
        <input type="text" :value="default" />
        <h5>per hour&nbsp;</h5>
        <icon-button classes="btn btn-save" base="save"></icon-button>
    </div>
</template>

<script>
import IconButton from './IconButton.vue';

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
