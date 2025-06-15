<script setup>
import DeleteStudent from "./DeleteStudent.vue";
import ManageBtn from "./ManageBtn.vue";

const goToStudent = (student_id) => {
    localStorage.setItem("student", student_id);
    window.location.href = `/manage/${student_id}`;
}
</script>

<template>
    <div :id="`row-${id}`" class="student-row">
        <div class="row-top">
            <span class="student-id">{{ id }}</span>
            <span class="student-name">{{ fname }} {{ lname }}</span>
            <span class="student-status">{{ (active === "true")? "Active" : "Inactive" }}</span>
            <span class="student-btn"><manage-btn @clicked="goToStudent(id)"></manage-btn></span>
            <span class="student-del"><delete-student @clicked="confirm_delete"></delete-student></span>
        </div>
        <div :id="`delete-conf-${id}`" class="row-bottom row-del hidden">
            <h5>Delete entry for {{ fname }} {{ lname }}?</h5>
            <p>You cannot undo this action, <strong>and all of {{ fname }}'s classes will also be deleted!</strong></p>
            <delete-student @clicked="do_delete" :long="true"></delete-student>
        </div>
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
    ],
    methods: {
        confirm_delete() {
            document.getElementById(`delete-conf-${this.id}`).classList.toggle("hidden");
        },
        async do_delete() {
            await fetch(`http://localhost:8081/api/students/delete/${this.id}`, {
                method: "delete"
            });
            window.location.reload();
        }
    }
}
</script>