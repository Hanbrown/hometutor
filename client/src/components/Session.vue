<script setup>
import ManageBtn from './ManageBtn.vue';
import DeleteStudent from './DeleteStudent.vue';
import { format_date, format_time, get_charge } from "../assets/util";

const emit = defineEmits(["selected"]);

const openDetails = (class_id) => {
    document.querySelector(`#details-${class_id}`).classList.toggle("hidden");
}

</script>

<template>
    <div :id="`row-${id}`" :class="`session-row ${paid ? '' : 'unpaid'}`">
        <div class="row-top">
            <!-- Show either a checked or unchecked box -->
            <span v-if="selected" class="table-text check-table"><input type="checkbox" checked @change="emit('selected')"/></span>
            <span v-else class="table-text check-table"><input type="checkbox" unchecked @change="emit('selected')"/></span>
            <!-- All the other fields -->
            <span class="table-text id-table">{{ id }}</span>
            <span class="table-text date-table">{{ format_date(time_in) }}</span>
            <span class="table-text time-table class-in">{{ format_time(time_in) }}</span>
            <span class="table-text time-table class-in">{{ format_time(time_out) }}</span>
            <span class="table-text rate-table">${{ rate }}</span>
            <span class="table-text charge-table">${{ get_charge(time_in, time_out, rate) }}</span>
            <span class="table-text btn-table"><manage-btn @clicked="openDetails(id)" should_switch=true></manage-btn></span>
        </div>
        <div :id="`details-${id}`" class="row-bottom hidden">
            <!-- Show either a checked or unchecked box -->
            <span class="table-input check-table-input">
                <input v-if="paid" type="checkbox" :id="`${id}-paid`" checked />
                <input v-else type="checkbox" :id="`${id}-paid`" unchecked />
                <label :for="`${id}-paid`">Paid</label>
            </span>
            <!-- All the other fields -->
            <span class="table-input date-table"><input type="text" :id="`${id}-date`" :value="`${format_date(time_in)}`"></span>
            <span class="table-input time-table class-in"><input type="text" :id="`${id}-intime`" :value="`${format_time(time_in)}`"></span>
            <span class="table-input time-table class-in"><input type="text" :id="`${id}-outtime`" :value="`${format_time(time_out)}`"></span>
            <span class="table-input rate-table"><input type="text" :id="`${id}-rate`" :value="rate"></span>
            <span class="table-input btn-table-input">
                <button class="btn btn-add" @click="editSession"><font-awesome-icon icon="save" /></button>&nbsp;&nbsp;
                <delete-student @click="deleteSession"></delete-student>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: "Session",
    props: {
        selected:       { required: false, default: "false", type: String },
        paid:           { required: false, default: "false", type: String },
        id:             { required: true, default: 9999, unique: true, type: Number },
        time_in:        { required: false, default: Date.now()-(1000*60*60), type: Date },
        time_out:       { required: false, default: Date.now(), type: Date },
        rate:           { required: true, default: 65, type: Number },
    },
    components: [
        ManageBtn,
        DeleteStudent
    ],
    methods: {
        /**
         * Edit a session
         */
        async editSession() {
            const _paid = document.getElementById(`${this.id}-paid`).checked;
            const _date = document.getElementById(`${this.id}-date`).value;
            const _in_time = document.getElementById(`${this.id}-intime`).value;
            const _out_time = document.getElementById(`${this.id}-outtime`).value;
            const _rate = document.getElementById(`${this.id}-rate`).value;

            let date = new Date(_date);
            let start = this.parseTime(_in_time);
            let end = this.parseTime(_out_time);

            start.setDate(date.getDate());
            start.setMonth(date.getMonth());
            start.setFullYear(date.getFullYear());

            end.setDate(date.getDate());
            end.setMonth(date.getMonth());
            end.setFullYear(date.getFullYear());

            const res = await fetch(`/api/sessions/update`, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student: Number(localStorage.getItem("student")),
                    number: this.id,
                    paid: _paid,
                    in_time: start,
                    out_time: end,
                    rate: _rate,
                }),
            });

            const res_json = await res.json();
            window.location.reload();
        },
        /**
         * Convert a string representation of time into a Date object. The day, month, and year are today.
         * @param time The time as a string, or 00:00 if time is invalid
         */
        parseTime(time) {
            const date = new Date();

            const dots = /^\d{1,2}\.\d{1,2}$/;
            const colon = /^\d{1,2}:\d{2}/;
            const nums = /^\d{3,4}$/;

            if (dots.test(time)) {
                let parts = time.split(".");
                date.setHours(Number(parts[0]));
                date.setMinutes(Number(parts[1]));
            }
            else if (colon.test(time)) {
                let parts = time.split(":");
                date.setHours(Number(parts[0]));
                date.setMinutes(Number(parts[1]));
            }
            else if (nums.test(time)) {
                let mins = time.substring(time.length-2);
                let hrs = time.substring(0, time.length-2);
                date.setHours(Number(hrs));
                date.setMinutes(Number(mins));
            }

            return date;
        },
        /**
         * Delete a session
         */
        async deleteSession() {
            const res = await fetch(`/api/sessions/delete`, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    number: this.id,
                    student: localStorage.getItem("student"),
                }),
            });
            const res_json = await res.json();
            window.location.reload();
        }
    }
}
</script>