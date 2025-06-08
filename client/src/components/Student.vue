<script setup>
import DeleteStudent from "./DeleteStudent.vue";
import ManageBtn from "./ManageBtn.vue";

// TODO: Perform a post request
const goToStudent = (student_id) => {
    window.location.href = "/manage";
}
</script>

<template>
    <tr :id="`row-${id}`" class="student-row">
        <td class="student-id">{{ id }}</td>
        <td class="student-name">{{ fname }} {{ lname }}</td>
        <td class="student-status">{{ (active === "true")? "Active" : "Inactive" }}</td>
        <td><manage-btn @clicked="goToStudent(id)"></manage-btn></td>
        <td><delete-student></delete-student></td>
    </tr>
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