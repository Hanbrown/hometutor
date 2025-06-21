<script setup>
import Student from "../components/Student.vue";
import RateMenu from "../components/RateMenu.vue";
import AuthMenu from "../components/AuthMenu.vue";
import NewStudent from "../components/NewStudent.vue";
import IconButton from "../components/IconButton.vue";

import { getCookie } from "../assets/util";
</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"><a class="screen-reader-only">Skip to Content</a></span>
                <h3>Students</h3>
                <auth-menu>{{ User.displayName.split(" ")[0] }}</auth-menu>
            </header>
            <div id="student-table">
                <div class="table-header">
                    <span class="table-text student-id-header"></span>
                    <span class="table-text student-name-header">Student</span>
                    <span class="table-text student-status">All</span>
                    <span class="table-text student-del-header"></span>
                    <span class="table-text student-btn-header">
                        <icon-button classes="btn btn-add" base="plus" alt="caret-up" @clicked="toggle_new_student"></icon-button>
                    </span>
                </div>
                <div class="row-container">
                        <new-student id="new-student-menu" class="hidden" @cancelled="toggle_new_student"></new-student>
                        <student v-for="(student) in Students"
                            :key="student.id_short"
                            :id="student.id_short"
                            :fname="student.fname" 
                            :lname="student.lname" 
                            :active="student.active.toString()"
                        ></student>
                        <div :class="`student-row`" v-if="Students.length === 0">
                            <h5 class="table-text rate-table">No Students, add one!</h5>
                        </div>
                </div>
            </div>
            <rate-menu :default="User.rate"></rate-menu>
        </div>
    </main>
</template>

<script>
export default {
    name: "app",
    components: {
        Student,
        RateMenu,
        NewStudent,
        IconButton
    },
    async mounted() {
        this.populateUser(),
        this.getStudents()
    },
    methods: {
        populateUser() {
            this.User = {
                user: getCookie("user"),
                displayName: decodeURIComponent(getCookie("displayName")),
                rate: getCookie("rate"),
            }
        },
        // TODO: Eventually send the cookie here
        async getStudents() {
            const user = this.User.user;
            const res = await fetch(`/api/students/read/${user}`);
            const res_json = await res.json();
            if (!res_json.error) {
                this.Students = res_json.data;
            }
            else {
                console.log("Error");
            }
        },
        toggle_new_student() {
            document.getElementById("new-student-menu").classList.toggle("hidden");
        }
    },
    data() {
        return {
            User: {},
            Students: [],
        }
    }
};
</script>