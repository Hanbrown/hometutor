<script setup>
import Student from "../components/Student.vue";
import RateMenu from "../components/RateMenu.vue";
import AddStudent from "../components/AddStudent.vue";
import AuthMenu from "../components/AuthMenu.vue";
import NewStudent from "../components/NewStudent.vue";

const toggle_new_student = () => {
    document.getElementById("new-student-menu").classList.toggle("hidden");
}
</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"><a class="screen-reader-only">Skip to Content</a></span>
                <h3>Student Management System</h3>
                <auth-menu></auth-menu>
            </header>
            <div id="student-table">
                <div class="table-header">
                    <span class="table-text student-id-header"></span>
                    <span class="table-text student-name-header">Student</span>
                    <span class="table-text student-status">All</span>
                    <span class="table-text student-del-header"></span>
                    <span class="table-text student-btn-header"><add-student @click="toggle_new_student"></add-student></span>
                </div>
                <div class="row-container">
                        <new-student id="new-student-menu" class="hidden" @cancelled="toggle_new_student"></new-student>
                        <student v-for="(student) in Students"
                            :key="student.id_short"
                            :id="student.id_short"
                            :fname="student.fname" 
                            :lname="student.lname" 
                            :active="student.active ? `true` : `false`"
                        ></student>
                </div>
            </div>
            <rate-menu></rate-menu>
        </div>
    </main>
</template>

<script>
export default {
    name: "app",
    components: {
        Student,
        RateMenu,
        AddStudent,
        NewStudent,
    },
    async mounted() {
        this.getStudents()
    },
    methods: {
        // TODO: Eventually send the cookie here
        async getStudents() {
            const res = await fetch("http://localhost:8081/api/students/read");
            const res_json = await res.json();
            console.log(res_json);
            this.Students = res_json.data;
        }
    },
    data() {
        return {
            Students: [],
        }
    }
};
</script>