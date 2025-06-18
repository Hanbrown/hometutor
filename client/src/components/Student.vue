<script setup>
import IconButton from "./IconButton.vue";

const goToStudent = (student_id) => {
    localStorage.setItem("student", student_id);
    window.location.href = `/manage/${student_id}`;
}
</script>

<template>
    <div :id="`row-${id}`" class="student-row">
        <div class="row-top">
            <span class="student-id">{{ id }}</span>
            <span class="student-name"><a :href="`/manage/${id}`">{{ fname }} {{ lname }}</a></span>
            <span class="student-status">{{ (active === "true")? "Active" : "Inactive" }}</span>
            <span class="student-btn">
                <icon-button classes="btn btn-manage" base="pencil" @clicked="goToStudent(id)"></icon-button>
            </span>
            <span class="student-del">
                <icon-button classes="btn btn-del" base="minus" alt="caret-up" @clicked="confirm_delete"></icon-button>
            </span>
        </div>
        <div :id="`delete-conf-${id}`" class="row-bottom row-del hidden">
            <h5>Delete entry for {{ fname }} {{ lname }}?</h5>
            <p>You cannot undo this action, <strong>and all of {{ fname }}'s classes will also be deleted!</strong></p>
            <icon-button classes="btn btn-del" base="minus" @clicked="do_delete"> Delete</icon-button>
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
        IconButton
    ],
    methods: {
        confirm_delete() {
            document.getElementById(`delete-conf-${this.id}`).classList.toggle("hidden");
        },
        async do_delete() {
            const res = await fetch(`/api/students/delete/${this.id}`, {
                method: "delete"
            });
            const res_json = await res.json();
            if (!res_json.error) {
                window.location.reload();
            }
            else {
                console.error(res_json.msg);
            }
        }
    }
}
</script>