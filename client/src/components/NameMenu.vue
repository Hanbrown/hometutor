<script setup>
import { getCookie } from '../assets/util';
import IconButton from './IconButton.vue';

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
        <icon-button classes="btn btn-save" @clicked="saveClick" base="save"></icon-button>
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
        saveClick: async () => {
            const _fname = document.getElementById("fname").value;
            const _lname = document.getElementById("lname").value;
            const _active = document.getElementById("active").checked;
            const _rate = document.getElementById("rate-field").value;

            await fetch("/api/students/update", {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: localStorage.getItem("student"),
                    fname: _fname,
                    lname: _lname,
                    active: _active,
                    rate: _rate
                }),
            });
            // const res_json = await response.json();
            window.location.reload();
        }
    }
};
</script>