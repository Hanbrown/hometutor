<script setup>
import { getCookie } from '../assets/util';
import IconButton from './IconButton.vue';

const emit = defineEmits(["saved"]);

</script>

<template>
    <div class="edit-name">
        <label for="fname" class="screen-reader-only">First</label>
        <input type="text" id="fname" :value="fname" />
        <label for="lname" class="screen-reader-only">Last</label>
        <input type="text" id="lname" :value="lname" />

        <label for="rate-field" class="screen-reader-only">Last</label>
        <label>$</label>
        <input type="text" id="rate-field" :value="rate" />
        <label>/hour</label>

        <span v-if="(active)"><label for="active">Active</label><input type="checkbox" id="active" checked /></span>
        <span v-else><label for="active">Active</label><input type="checkbox" id="active" unchecked /></span>
        <icon-button classes="btn btn-add" @clicked="saveClick" base="save"></icon-button>
        <span class="spinner hidden"><font-awesome-icon icon="rotate" /></span>
    </div>
</template>

<script>
export default {
    name: "NameMenu",
    props: {
        fname: {required: true, default: "", type: String},
        lname: {required: true, default: "", type: String},
        active: {required: true, default: true, type: Boolean},
        rate: {required: true, default: 60, type: Number}
    },
    components: {
        IconButton
    },
    methods: {
        saveClick() {
            const _fname = document.getElementById("fname").value;
            const _lname = document.getElementById("lname").value;
            const _active = document.getElementById("active").checked;
            const _rate = document.getElementById("rate-field").value.toString();

            this.$emit("saved", {fname: _fname, lname: _lname, active: _active, rate: _rate});
        }
    }
};
</script>