<script setup>
import DeleteStudent from "./DeleteStudent.vue";
import ManageBtn from "./ManageBtn.vue";

// TODO: Perform a post request
const goToStudent = (student_id) => {
    window.location.href = "/manage";
}
</script>

<template>
    <div :id="`row-${id}`" class="student-row">
        <span class="student-id">{{ id }}</span>
        <span class="student-name">{{ fname }} {{ lname }}</span>
        <span class="student-status">{{ (active === "true")? "Active" : "Inactive" }}</span>
        <span class="student-btn"><manage-btn @clicked="goToStudent(id)"></manage-btn></span>
        <span class="student-del"><delete-student></delete-student></span>
    </div>
</template>

<script>

export default {
    name: "Student",
    props: {
        id:             { required: true, default: 9999, type: Number },
        fname:          { required: false, default: "Joost", type: String },
        lname:          { required: false, default: "Doe", type: String },
        active:         { required: true, default: true, type: Boolean }
    },
    components: [
        DeleteStudent,
        ManageBtn
    ]
}
</script>