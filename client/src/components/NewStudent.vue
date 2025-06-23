<script setup>
import { getCookie } from '../assets/util';
import IconButton from './IconButton.vue';

const emit = defineEmits(["cancelled"]);

</script>

<template>
    <div class="student-row add-menu">
        <div class="flex-25"><input id="new_student_fname" type="text" name="fname" placeholder="First Name"></div>
        <div class="flex-25"><input id="new_student_lname" type="text" name="lname" placeholder="Last Name"></div>
        <div class="flex-20">$<input id="new_student_rate" type="text" name="new-rate" placeholder="Rate" :value="default">&nbsp;/hr</div>
        <div class="flex-20"><input id="new_student_active" type="checkbox" checked><label for="new_student_active">Active?</label></div>
        <div class="flex-10"><icon-button classes="btn btn-save" base="save" label="Save changes" @clicked="save_new_student"></icon-button></div>
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
            try {
                const res = await fetch("/api/students/add", {
                    method: "post",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fname: fname,
                        lname: lname,
                        active: active,
                        rate: rate
                    }),
                });
                const data = await res.json();
                if (data.error !== true) {
                    window.location.reload();
                }
                else {
                    window.alert("Error, please try again");
                }
            }
            catch (err) {
                console.log(err);
            }
        }, 
        disableSaves() {
            const buttons = document.querySelectorAll(".btn-save");
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].setAttribute("disabled", "disabled");
            }
        },
        enableSaves() {
            const buttons = document.querySelectorAll(".btn-save");
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].removeAttribute("disabled");
            }
        }
    }
}
</script>