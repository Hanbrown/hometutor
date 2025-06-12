<script setup>
import CancelButton from './CancelButton.vue';
import SaveButton from './SaveButton.vue';

const emit = defineEmits(["cancelled"]);

const disableSaves = () => {
    const buttons = document.querySelectorAll(".btn-save");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("disabled", "disabled");
    }
}
const enableSaves = () => {
    const buttons = document.querySelectorAll(".btn-save");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].removeAttribute("disabled");
    }
}

const save_new_student = async () => {
    disableSaves();
    const fname = document.getElementById("new_student_fname").value;
    const lname = document.getElementById("new_student_lname").value;
    const active = document.getElementById("new_student_active").checked;
    try {
        const res = await fetch("http://localhost:8081/api/students/add", {
            method: "post",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fname: fname,
                lname: lname,
                active: active,
            }),
        });
        const data = await res.json();
        if (data.error !== true) {
            window.location.reload();
        }
        else {
            window.alert("Error, please try again");
            enableSaves();
        }
    }
    catch (err) {
        console.log(err);
    }
}
</script>

<template>
    <div class="student-row">
        <span class="student-id"></span>
        <span class="student-name"><input id="new_student_fname" type="text" name="fname">&nbsp;<input id="new_student_lname" type="text" name="lname"></span>
        <span class="student-status"><input id="new_student_active" type="checkbox" checked><label for="new_student_active">Active?</label></span>
        <span class="student-btn"><save-button @saved="save_new_student"></save-button></span>
        <span class="student-del"><cancel-button @click="emit(`cancelled`)"></cancel-button></span>
    </div>
</template>

<script>
export default {
    name: "NewStudent",
    components: {
        SaveButton,
        CancelButton,
    }
}
</script>