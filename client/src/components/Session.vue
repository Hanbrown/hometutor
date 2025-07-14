<script setup>
import { format_date, format_time, get_charge, getCookie } from "../assets/util";
import IconButton from './IconButton.vue';

const emit = defineEmits(["selected", "edited", "deleted"]);

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
            <span v-if="paid" class="table-text id-table">&nbsp;</span>
            <span v-else class="table-text id-table" title="Unpaid Session"><font-awesome-icon icon="file-invoice-dollar" /></span>
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
                <icon-button classes="btn btn-add" label="Save changes" @clicked="editSession" base="save"></icon-button>
                <span class="spinner hidden"><font-awesome-icon icon="rotate" /></span>
                &nbsp;&nbsp;
                <icon-button classes="btn btn-del" label="Delete session" @clicked="deleteSession" base="minus"></icon-button>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: "Session",
    props: {
        id:             { required: true, default: 9999, unique: true, type: Number },
        selected:       { required: false, default: false, type: Boolean },
        paid:           { required: false, default: false, type: Boolean },
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
        editSession() {
            const _selected = document.getElementById(`${this.id}-checkbox`).checked;
            const _paid = document.getElementById(`${this.id}-paid`).checked;
            const _date = document.getElementById(`${this.id}-date`).value;
            const _in_time = document.getElementById(`${this.id}-intime`).value;
            const _out_time = document.getElementById(`${this.id}-outtime`).value;
            const _rate = document.getElementById(`${this.id}-rate`).value;

            this.$emit("edited", {id: this.id, selected: _selected, paid: _paid, date: _date, in_time: _in_time, out_time: _out_time, rate: _rate});
        },
        /**
         * Delete a session
         */
        deleteSession() {
            this.$emit("deleted", {id: this.id});
        }
    }
}
</script>