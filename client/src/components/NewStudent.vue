<script setup>
import IconButton from './IconButton.vue';

const emit = defineEmits(["cancelled", "saved"]);

</script>

<template>
    <div class="student-row add-menu">
        <div class="flex-25"><input id="new_student_fname" type="text" name="fname" placeholder="First Name"></div>
        <div class="flex-25"><input id="new_student_lname" type="text" name="lname" placeholder="Last Name"></div>
        <div class="flex-20">$<input id="new_student_rate" type="text" name="new-rate" placeholder="Rate" :value="default">&nbsp;/hr</div>
        <div class="flex-20"><input id="new_student_active" type="checkbox" checked><label for="new_student_active">Active?</label></div>
        <div class="flex-10">
            <icon-button classes="btn btn-add" base="save" label="Save changes" @clicked="save_new_student"></icon-button>
            <span class="spinner hidden"><font-awesome-icon icon="rotate" /></span>
        </div>
    </div>
</template>

<script>
export default {
    name: "NewStudent",
    components: {
        IconButton
    },
    props: {
        default: {required: true, default: 65.00, type: Number},
    },
    methods: {
        async save_new_student() {
            const fname = document.getElementById("new_student_fname").value;
            const lname = document.getElementById("new_student_lname").value;
            const active = document.getElementById("new_student_active").checked;
            const rate = document.getElementById("new_student_rate").value;

            this.$emit("saved", {"fname": fname, "lname": lname, "active": active, "rate": Number(rate)});
        }
    }
}
</script>