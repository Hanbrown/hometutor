<script setup>
import Student from "../components/Student.vue";
import RateMenu from "../components/RateMenu.vue";
import AddStudent from "../components/AddStudent.vue";
import AuthMenu from "../components/AuthMenu.vue";
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
                    <span class="table-text student-btn-header"><add-student></add-student></span>
                </div>
                <div class="row-container">
                        <student v-for="(student) in Students"
                            :key="student.id"
                            :id="student.id"
                            :fname="student.fname" 
                            :lname="student.lname" 
                            :active="student.active"
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
    },
    data() {
        return {
            Students: [
                {id: "0339", fname: "Pranav", lname: "Rao", active: "true"},
                {id: "9090", fname: "Sujesh", lname: "Sterdhasahastrabudeshanticurry", active: "false"},
                {id: "9091", fname: "Rujula", lname: "Rao", active: "true"},
            ],
        }
    }
};
</script>