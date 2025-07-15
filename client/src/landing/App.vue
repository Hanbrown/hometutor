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
                <auth-menu>{{ User.displayName ? User.displayName.split(" ")[0] : "Joost" }}</auth-menu>
            </header>
            <div id="student-table">
                <div class="table-header">
                    <span class="table-text student-id-header"></span>
                    <span class="table-text student-name-header">Student</span>
                    <span class="table-text student-status">All</span>
                    <span class="table-text student-del-header"></span>
                    <span class="table-text student-btn-header">
                        <icon-button classes="btn btn-add" base="plus" alt="caret-up" label="Open/close new student menu" @clicked="toggle_new_student"></icon-button>
                    </span>
                </div>
                <div class="row-container">
                        <new-student id="new-student-menu" class="hidden" :default="User.rate" @cancelled="toggle_new_student"></new-student>
                        <student v-for="(student) in Students"
                            :key="student.id"
                            :id="student.id"
                            :fname="student.fname" 
                            :lname="student.lname" 
                            :active="student.active.toString()"
                        ></student>
                        <div :class="`student-row`" v-if="Students.length === 0">
                            <h5 class="table-text rate-table">No Students, add one!</h5>
                        </div>
                </div>
            </div>
            <rate-menu :default="User.rate" @saved="save_rate"></rate-menu>
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
                displayName: decodeURIComponent(getCookie("displayName")),
                rate: getCookie("rate"),
            }
        },
        // TODO: Eventually send the cookie here
        async getStudents() {
            const res = await fetch(`/api/students/read`);
            const res_json = await res.json();
            if (!res_json.error) {
                this.Students = res_json.data;
            }
            else {
                console.log("Error");
            }
        },
        async save_rate() {
            document.querySelector("#rate-menu .btn-add").classList.add("hidden");
            document.querySelector("#rate-menu .spinner").classList.remove("hidden");

            const _rate = document.getElementById("rate-field").value;
            const res = await fetch(`/api/users/update`, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rate: _rate
                })
            });
            const res_json = await res.json();
            if (res_json.error) {
                window.alert(res_json.msg);
            }
            else {
                this.User.rate = _rate;
            }            
            document.querySelector("#rate-menu .btn-add").classList.remove("hidden");
            document.querySelector("#rate-menu .spinner").classList.add("hidden");

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