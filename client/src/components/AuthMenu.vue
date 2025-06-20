<script setup>
import IconButton from './IconButton.vue';

const toggleMenu = () => {
    document.getElementById("signon").classList.toggle("hidden");
}
</script>

<template>
    <div id="auth-menu">
        <icon-button classes="btn btn-profile" @clicked="toggleMenu" base="user"></icon-button>
        <div id="signon" class="hidden">
            <!-- <div class="g-signin2" data-onsuccess="onSignIn"></div> -->
            <a><slot /></a>
            <a href="/api/auth/logout">Logout</a>
        </div>
    </div>
</template>

<script>
export default {
    components: {
        IconButton
    }
};
</script>
