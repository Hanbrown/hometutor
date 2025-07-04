<script setup>
import { format_date, format_time, get_charge } from "../assets/util";
import IconButton from './IconButton.vue';

const emit = defineEmits(["selected"]);

const openDetails = (class_id) => {
    document.querySelector(`#details-${class_id}`).classList.toggle("hidden");
}

</script>

<template>
    <div :id="`row-${id}`" :class="`session-row ${paid ? '' : 'unpaid'}`">
        <div class="row-top">
            <!-- Show either a checked or unchecked box -->
            <span v-if="selected" class="table-text check-table"><label class="screen-reader-only" :for="`${id}-checkbox`">Use in invoice</label><input :id="`${id}-checkbox`" type="checkbox" checked @change="emit('selected')"/></span>
            <span v-else class="table-text check-table"><label class="screen-reader-only" :for="`${id}-checkbox`">Use in invoice</label><input :id="`${id}-checkbox`" type="checkbox" unchecked @change="emit('selected')"/></span>
            <!-- All the other fields -->
            <span class="table-text id-table">&nbsp;</span>
            <span class="table-text date-table">{{ format_date(time_in) }}</span>
            <span class="table-text time-table class-in">{{ format_time(time_in) }}</span>
            <span class="table-text time-table class-in">{{ format_time(time_out) }}</span>
            <span class="table-text rate-table">${{ rate }}</span>
            <span class="table-text charge-table">${{ get_charge(time_in, time_out, rate) }}</span>
            <span class="table-text btn-table">
                <icon-button classes="btn btn-manage" label="Manage this session" @clicked="openDetails(id)" base="pencil" alt="caret-up"></icon-button>
            </span>
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
                <icon-button classes="btn btn-save" label="Save changes" @clicked="editSession" base="save"></icon-button>&nbsp;&nbsp;
                <icon-button classes="btn btn-del" label="Delete session" @clicked="deleteSession" base="minus"></icon-button>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: "Session",
    props: {
        selected:       { required: false, default: false, type: Boolean },
        paid:           { required: false, default: false, type: Boolean },
        id:             { required: true, default: 9999, unique: true, type: Number },
        time_in:        { required: false, default: Date.now()-(1000*60*60), type: String },
        time_out:       { required: false, default: Date.now(), type: String },
        rate:           { required: true, default: 65, type: Number },
    },
    components: [
        IconButton
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
         * @param time The time as a string, or current time if time is invalid
         */
        parseTime(time) {
            // Check input for validity, return current time if invalid
            const short_pat = /^\d{1,2}\s?\w{2}$/;
            const long_pat = /^\d{1,2}\W?\d{1,2}\s?(\w{2})?$/;
            if (short_pat.test(time)) {
                const delim = /\W/g; // Anything not a letter or number
                time = time.toLowerCase();
                time = time.replaceAll(delim, ""); // Remove delimiters and spaces

                let time_obj = new Date();
                if (time.substring(time.length-2) === "am") {
                    let hrs = Number(time.substring(0, time.length-2));
                    if (hrs === 12 || hrs < 0) {
                        time_obj.setHours(0);
                    }
                    else if (hrs > 12) {
                        time_obj.setHours(hrs % 12);
                    }
                    else {
                        time_obj.setHours(hrs);
                    }
                    time_obj.setMinutes(0);
                    time_obj.setSeconds(0);
                    
                    return time_obj;
                }
                else if (time.substring(time.length-2) === "pm") {
                    let hrs = Number(time.substring(0, time.length-2));
                    if (hrs > 12) {
                        time_obj.setHours((hrs % 12) + 12);
                    }
                    else if (hrs === 12 || hrs <= 0) {
                        time_obj.setHours(12);
                    }
                    else {
                        time_obj.setHours(hrs+12);
                    }
                    time_obj.setMinutes(0);
                    time_obj.setSeconds(0);
                    
                    return time_obj;
                }
                else {
                    return new Date();
                }
            }
            else if (long_pat.test(time)) {
                const delim = /\W/g; // Anything not a letter or number
                time = time.toLowerCase();
                time = time.replaceAll(delim, ""); // Remove delimiters and spaces

                let meridian = false;
                let offset = 0;
                
                // Trim am/pm if it's there and set adjustment variables
                if (time.substring(time.length-2) === "am") {
                    meridian = true;
                    offset = 0;
                    time = time.substring(0, time.length-2);
                }
                else if (time.substring(time.length-2) === "pm") {
                    meridian = true;
                    offset = 12;
                    time = time.substring(0, time.length-2);
                }

                // Get the numbers
                let mins, hrs;
                mins = Number(time.substring(time.length-2));
                hrs = Number(time.substring(0, time.length-2));

                // Ignore meridian if user wrote 25 or something
                if (hrs >= 24) {
                    meridian = false;
                }

                // Modulo so that large numbers can still be interpreted
                mins = mins % 60;
                hrs = hrs % 24;

                // Adjust hours if meridian was provided. 12:00 is a special case
                if (hrs < 12 && meridian) {
                    hrs += offset;
                }
                else if (hrs === 12 && meridian) {
                    if (offset === 0) {
                        hrs = 0;
                    }
                }

                // Hooray, we're done!
                let time_obj = new Date();
                time_obj.setHours(hrs);
                time_obj.setMinutes(mins);
                time_obj.setSeconds(0);

                return time_obj;
            }
            else {
                return new Date();
            }
        },
        /**
         * Delete a session
         */
        async deleteSession() {
            if (window.confirm("Delete this session?")) {
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
                if (!res_json.error) {
                    window.location.reload();
                }
                else {
                    console.error(res_json.msg);
                }
            }
        }
    }
}
</script>