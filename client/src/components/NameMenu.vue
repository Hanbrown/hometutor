<script setup>
import IconButton from './IconButton.vue';

</script>

<template>
    <div class="edit-name">
        <label for="fname">Name</label>
        <input type="text" id="fname" :value="fname" />
        <input type="text" id="lname" :value="lname" />

        <label for="active">Active</label>
        <span v-if="(active)" class="table-text check-table"><input type="checkbox" id="active" checked /></span>
        <span v-else class="table-text check-table"><input type="checkbox" id="active" unchecked /></span>
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
    },
    components: {
        IconButton
    },
    methods: {
        saveClick: async () => {
            const _fname = document.getElementById("fname").value;
            const _lname = document.getElementById("lname").value;
            const _active = document.getElementById("active").checked;

            const response = await fetch("/api/students/update", {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_short: localStorage.getItem("student"),
                    fname: _fname,
                    lname: _lname,
                    active: _active,
                }),
            });
            const res_json = await response.json();
            window.location.reload();
        }
    }
};
</script>